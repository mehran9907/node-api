import BaseController from "../core/BaseController.js";
import CategoryModel from "../models/category.js";
import { body, validationResult } from "express-validator";
import { getEnv, toObjectId } from "../core/utils.js";

export default class CategoryController extends BaseController {
    #categoryModel = null;
    #basePath = getEnv('APP_URL') + 'category/';
    #url = this.#basePath;
    constructor() {
        super();
        this.#categoryModel = new CategoryModel();
    }

    async #validation(req) {
        await body('parent_id').not().isEmpty().withMessage({"code": 1, "msg": "Parent ID is required", "is_auth": 0}).run(req);
        await body('title').not().isEmpty().withMessage({"code": 2, "msg": "Title is required", "is_auth": 0}).run(req);
        await body('slug').not().isEmpty().withMessage({"code": 3, "msg": "Slug is required", "is_auth": 0}).custom(() => {
            const slug = this.input(req.body.slug);
            const check = /^[a-z0-9-]+$/.test(slug);
            if (check)
                return true;
            else
                throw new Error(4);
        }).run(req);
        await body('title_seo').not().isEmpty().withMessage({"code": 5, "msg": "SEO title is required", "is_auth": 0}).run(req);
        await body('description_seo').not().isEmpty().withMessage({"code": 6, "msg": "SEO description is required", "is_auth": 0}).run(req);
        return validationResult(req);
    }

    async index(req, res) {
        try {
            // const categories = await this.#categoryModel.
            const sortFields = ["_id", "parent_id", "title", "last_edit_date_time", "status"];
            const {page, sort_field, sort_type, limit} = this.handlePagination(req, sortFields);
            const {params, params_query} = this.#getParams(req);
            const pagination = await this.#categoryModel.pagination(limit, page, sort_field, sort_type, params?.parent_id, params?.title);
            const data = {
                "pagination": pagination,
                "page": page
            };
            return res.json({"code": 0, "msg": "List all categories", "is_auth": 0, "data": data});
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    async show(req, res) {
        try {
            const id = toObjectId(this.input(req.params.id), true);
            if (id === '') {
                return res.json({"code": 1, "msg": "Invalid category id!", "is_auth": 0});
            }
            const category = await this.#categoryModel.getCategory(id);
            
            if (category?._id)
                return res.json({"code": 0, "msg": "success", "is_auth": 0, "category": category});
            else
                return res.json({"code": 2, "msg": "Category not found!", "is_auth": 0});
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    async changeStatus(req, res) {
        const id = toObjectId(this.input(req.params.id));
        let status = this.safeString(this.input(req.body.status));
        if (id === '') {
            return res.json({"code": 1, "msg": "Invalid category id!", "is_auth": 0});
        }
        const category = await this.#categoryModel.getCategory(id);
        if (category?._id) {
            status = (status === "1") ? true : false;
            let result = await this.#categoryModel.changeStatus(id, status);
            switch (result) {
                case 1:
                    return res.json({"code": 0, "msg": "Category status has changed", "is_auth": 0, "data": category});
                case 0:
                    return res.json({"code": 3, "msg": "Something went wrong. Please try again later", "is_auth": 0});
            }
        } else
            return res.json({"code": 2, "msg": "Category not found", "is_auth": 0});
    }

    async remove(req, res) {
        const id = toObjectId(this.input(req.params.id));
        if (id === '') {
            return res.json({"code": 1, "msg": "Invalid category id!", "is_auth": 0});
        }
        const category = await this.#categoryModel.getCategory(id);
        if (category?._id) {
            const result = await this.#categoryModel.delete(id);
            switch (result) {
                case -1:
                    return res.json({"code": 1, "msg": "Invalid category id!", "is_auth": 0});
                case 1:
                    return res.json({"code": 0, "msg": "Category has been removed", "is_auth": 0});
                case 0:
                    return res.json({"code": 3, "msg": "Something went wrong. Please try again later", "is_auth": 0});
                case -2:
                    return res.json({"code": 4, "msg": "You can not remove a parent category which contains child!", "is_auth": 0});
            }
        } else
            return res.json({"code": 2, "msg": "Category not found", "is_auth": 0});
    }

    async add(req, res) {
        try {
            const result = await this.#validation(req);
            if (!result.isEmpty()) {
                if(result?.errors[0]?.msg == "4") {
                    return res.json({"code": 4, "msg": "Category slug is not valid", "is_auth": 0});
                } else {
                    return res.json(result?.errors[0]?.msg);
                }
            }
            const parent_id = this.safeString(this.input(req.body.parent_id));
            const title = this.safeString(this.input(req.body.title));
            const title_seo = this.safeString(this.input(req.body.title_seo));
            const description_seo = this.safeString(this.input(req.body.description_seo));
            const slug = this.safeString(this.input(req.body.slug));
            let status = this.safeString(this.input(req.body.status));
            status = (status === "1") ? true : false;

            if (parent_id !== "0") {
                if (!toObjectId(parent_id)) {
                    return res.json({"code": 7, "msg": "Parent ID is not valid", "is_auth": 0});
                }
            }

            const addResult = await this.#categoryModel.add(parent_id, title, slug, status, title_seo, description_seo);
            if (typeof addResult === 'number') {
                switch (addResult) {
                    case -1:
                        return res.json({"code": 9, "msg": "Title already exists! Please choose another one", "is_auth": 0});
                    case -2:
                        return res.json({"code": 10, "msg": "Slug already exists! Please choose another one", "is_auth": 0});
                }
            } else if (addResult?._id)
                return res.json({"code": 0, "msg": "Category added successfully", "is_auth": 0, "data": result});
            else
                return res.json({"code": 8, "msg": "Something went wrong! Please try again later", "is_auth": 0});
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    async postEdit(req, res) {
        try {
            const categoryID = toObjectId(this.input(req.params.id), true);
            let { page } = this.getPage(req);
            page = (page > 1) ? page : 1;
            const {params, params_query} = this.#getParams(req);
            const url = this.#url + `edit/${categoryID}?` + params_query + `&page=${page}`;
            
            if(!this.checkCsrfToken(req)) {
                return res.redirect(`${url}&msg=invalid-csrf`);
            }

            const parent_id = this.safeString(this.input(req.body.parent_id));
            const title = this.safeString(this.input(req.body.title));
            const slug = this.safeString(this.input(req.body.slug));
            const title_seo = this.safeString(this.input(req.body.title_seo));
            const description_seo = this.safeString(this.input(req.body.description_seo));
            const status = this.safeString(this.input(req.body.status));

            const formData = {parent_id, title, slug, title_seo, description_seo, status};

            const result = await this.#validation(req);

            if(!result.isEmpty()) {
                return res.redirect(`${url}&msg=${result?.errors[0]?.msg}`);
            } else {
                if (parent_id !== "0") {
                    if (!toObjectId(parent_id)) {
                        return res.redirect(`${url}&msg=invalid_parent_id`);
                    }
                }
                const result = await this.#categoryModel.update(categoryID, formData);
                if (result === 1) {
                    return res.redirect(`${url}&msg=success`);
                } else if (result === -1) {
                    return res.redirect(`${url}&msg=err9`);
                } else if(result === -2) {
                    return res.redirect(`${url}&msg=err7`);
                } else if(result === -3) {
                    return res.redirect(`${url}&msg=err8`);
                } else {
                    return res.redirect(`${url}&msg=err`);
                }
            }
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    async delete(req, res) {
        try {
            const {params, params_query} = this.#getParams(req);
            const url = this.#url + '?' + params_query;
            const id = toObjectId(this.input(req.params.id), true);
            let { page } = this.getPage(req);
            page = (page > 1) ? page : 1;

            const result = await this.#categoryModel.delete(id);

            if (result === 1)
                return res.redirect(url + `&page=${page}&msg=success-delete`);
            else if(result === -1)
                return res.redirect(url + `&page=${page}&msg=no-record`);
            else if(result === -2)
                return res.redirect(url + `&page=${page}&msg=child-exists`);
            else
                return res.redirect(url + `&page=${page}&msg=delete-error`);
            
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    #getParams(req) {
        try {
            const title = this.safeString(this.input(req.query.title));
            let parent_id = this.safeString(this.input(req.query.parent_id));
            parent_id = (parent_id === "0") ? 0 : toObjectId(parent_id, true);
            const params = { parent_id, title };
            const paramsQuery = this.toQuery(params);
            
            return {
                "params": params,
                "params_query": paramsQuery
            };
        } catch (e) {
            return {
                "params": {},
                "params_query": ''
            };
        }
    }
}