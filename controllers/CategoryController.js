import BaseController from "../core/BaseController.js";
import translate from "../core/translate.js";
import CategoryModel from "../models/category.js";
import { body, validationResult } from "express-validator";
import { getEnv, getPath, log, toObjectId } from "../core/utils.js";
import { checkImgMime, fileNameGenerator, toByte } from "../core/uploader.js";
import { fileExists, unlink } from "../core/fs.js";

export default class CategoryController extends BaseController {
    #categoryModel = null;
    #basePath = getEnv('APP_URL') + 'category/';
    #url = this.#basePath;
    constructor() {
        super();
        this.#categoryModel = new CategoryModel();
    }

    async add(req, res) {
        try {
            const categories = await this.#categoryModel.getMainCategories();
            const data = {
                "title": translate.t('category.page_title'),
                "form_data": req?.session?.category_add_data,
                "categories": categories
            };
            return res.render("category/add", data);
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    async #validation(req) {
        await body('parent_id').not().isEmpty().withMessage('err1').run(req);
        await body('title').not().isEmpty().withMessage('err2').run(req);
        await body('slug').not().isEmpty().withMessage('err3').custom(() => {
            const slug = this.input(req.body.slug);
            const check = /^[a-z0-9-]+$/.test(slug);
            if (check)
                return true;
            else
                throw new Error("err4");
        }).run(req);
        await body('title_seo').not().isEmpty().withMessage('err5').run(req);
        await body('description_seo').not().isEmpty().withMessage('err6').run(req);
        return validationResult(req);
    }

    async postAdd(req, res) {
        try {
            if(!this.checkCsrfToken(req)) {
                return res.redirect(`${this.#url}add?msg=invalid-csrf`);
            }

            const parent_id = this.safeString(this.input(req.body.parent_id));
            const title = this.safeString(this.input(req.body.title));
            const slug = this.safeString(this.input(req.body.slug));
            const title_seo = this.safeString(this.input(req.body.title_seo));
            const description_seo = this.safeString(this.input(req.body.description_seo));
            const status = this.safeString(this.input(req.body.status));

            const formData = {parent_id, title, slug, title_seo, description_seo, status}
            req.session.category_add_data = formData;

            const result = await this.#validation(req);

            if(!result.isEmpty()) {
                return res.redirect(`${this.#url}add?msg=${result?.errors[0]?.msg}`);
            } else {
                if (parent_id !== "0") {
                    if (!toObjectId(parent_id)) {
                        return res.redirect(`${this.#url}add?msg=invalid_parent_id`);
                    }
                }
                const result = await this.#categoryModel.add(formData);
                if (result?._id) {
                    delete req?.session?.category_add_data;
                    return res.redirect(`${this.#url}add?msg=ok`);
                } else if(result === -1) {
                    return res.redirect(`${this.#url}add?msg=err7`);
                } else if(result === -2) {
                    return res.redirect(`${this.#url}add?msg=err8`);
                } else {
                    return res.redirect(`${this.#url}add?msg=err`);
                }
            }
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    async index(req, res) {
        try {
            const sortFields = ['_id', 'parent_id', 'title', 'last_edit_date_time', 'status'];
            const {page, sort_field, sort_type} = this.handlePagination(req, sortFields);
            const status_id = toObjectId(this.input(req.query.status_id), true);
            const status = this.toNumber(this.input(req.query.status));
            const {params, params_query} = this.#getParams(req);
            const url = this.#url + '?' + params_query;
            const delete_url = this.#url + 'delete/';

            if (status_id !== '') {
                await this.#categoryModel.changeStatus(status_id, status);
                return res.redirect(url + `&page=${page}&msg=status-changed`);
            }

            const categories = await this.#categoryModel.getMainCategories();
            const pagination = await this.#categoryModel.pagination(page, sort_field, sort_type, params?.parent_id, params?.title);

            const data = {
                "title": translate.t("menu_category_list"),
                "rows": pagination.rows,
                "categories": categories,
                "total_rows": pagination.totalRows,
                "total_pages": pagination.totalPages,
                "url": url,
                "delete_url": delete_url,
                "params": params,
                "sortFields": sortFields,
                "page": page,
                "basePath": this.#basePath,
                "paramsQuery": params_query
            };
            return res.render("category/index", data);
        } catch (e) {
            return super.toError(e, req, res);
        }
    }

    async edit(req, res) {
        try {
            let { page } = this.getPage(req);
            page = (page > 1) ? page : 1;
            const {params, params_query} = this.#getParams(req);
            const back_url = this.#url + '?' + params_query + `&page=${page}`;
            const categories = await this.#categoryModel.getMainCategories();
            const categoryID = toObjectId(this.input(req.params.id), true);

            if (categoryID === '') {
                return res.redirect(back_url);
            }
                
            const row = await this.#categoryModel.getCategory(categoryID);

            if (!row) {
                return res.redirect(back_url);
            }

            let rowJSON = row.toJSON();
            rowJSON.parent_id = rowJSON.parent_id + '';

            log(rowJSON);

            const data = {
                "title": translate.t("category.page_title_edit"),
                "categories": categories,
                "back_url": back_url,
                
                "row": rowJSON
            };
            return res.render("category/edit", data);
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