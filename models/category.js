import CategorySchema from "../schemas/category.js";
import { MongoDB } from "../global.js";
import { getEnv, log, toObjectId } from "../core/utils.js";
import datetime from "../core/datetime.js";

export default class CategoryModel {
    constructor() {
        this.model = MongoDB.db.model("category", CategorySchema);
    }

    async add(parent_id, title, slug, status, title_seo, description_seo) {
        const last_edit_date_time = datetime.toString();
        parent_id = (parent_id === "0") ? null : parent_id;
        data["last_edit_date_time"] = last_edit_date_time;
        
        const titleExists = await this.#checkTitle(data.parent_id, data.title);
        if (titleExists > 0) {
            return -1; // Category already exists with this title
        }

        const slugExists = await this.#checkSlug(data.slug);
        if (slugExists > 0) {
            return -2; // Category already exists with this slug
        }

        const row = new this.model(data);
        return await row.save();
    }

    async #checkTitle(parent_id, title) {
        return await this.model.findOne(
            { 
                parent_id: parent_id, 
                title: {
                    $regex: title,
                    "$options": "i"
                }
            }
        ).countDocuments();
    }

    async #checkSlug(slug) {
        return await this.model.findOne({ slug: slug }).countDocuments();
    }

    async getMainCategories() {
        try {
            return await this.model.find( {"parent_id": null} ).sort([['title', 1]]);
        } catch (err) {
            return {};
        }
    }

    async pagination(limit, page, sortField, sortType, parent_id, title) {
        const where = {};

        if (parent_id !== '') {
            parent_id = (parent_id === 0) ? null : parent_id;
            where['parent_id'] = parent_id;
            
        }

        if (title !== '') {
            where['title'] = {$regex: '.*' + title + '.*', "$options": "i"};
        }

        const per_page = limit;
        const from = per_page * page - per_page;
        const totalRows = await this.model.findOne(where).countDocuments();
        const totalPages = Math.ceil(totalRows / per_page);
        const rows = await this.model.find(where).sort([[sortField, sortType]]).populate("parent_id", { title:1 }).skip(from).limit(per_page);

        return {
            totalPages,
            totalRows,
            rows
        };
    }

    async changeStatus(id, status) {
        try {
            const last_edit_date_time = datetime.toString();
            const data = {"status": status, "last_edit_date_time": last_edit_date_time};
            await this.model.updateOne({"_id": status_id}, {
                "$set": data
            });
            return 1;
        } catch (e) {
            return 0;
        }
    }

    async getCategory(id) {
        try {
            return await this.model.findOne({"_id": id}).populate('parent_id', {title: 1});
        } catch (e) {
            return {};
        }
    }

    async update(id, data) {
        if (!toObjectId(id))
            return -1;

        const currentRow = await this.getCategory(id);

        if (!currentRow)
            return -1;

        const last_edit_date_time = datetime.toString();
        data["last_edit_date_time"] = last_edit_date_time;
        data.parent_id = (data.parent_id === "0") ? null : data.parent_id;
        
        if (currentRow['title'] !== data.title) {
            const titleExists = await this.#checkTitle(data.parent_id, data.title);
            if (titleExists > 0)
                return -2;
        } else
            delete data.title;

        if (currentRow['slug'] !== data.slug) {
            const slugExists = await this.#checkSlug(data.slug);
            if (slugExists > 0)
                return -3;
        } else
            delete data.slug;

        if (currentRow['parent_id'] != data.parent_id) {
            const parentExists = await this.#checkTitle(data.parent_id, data.title);
            if (parentExists > 0)
                return -4;
        } else
            delete data.parent_id;

        const result = await this.model.updateOne({"_id": id}, {
            "$set": data
        });

        if (result?.modifiedCount > 0)
            return 1;
        else
            return 0;
    }

    async delete(id) {
        if (!toObjectId(id))
            return -1;

        const row = await this.getCategory(id);
        let result;

        if (!row)
            return -1;
         
        if (row['parent_id'] === null) {
            const childsCount = await this.model.findOne({ "parent_id" : id}).countDocuments();
            if (childsCount > 0)
                return -2;
            else
                result = await this.model.deleteOne({ "_id": id });
        } else
            result = await this.model.deleteOne({ "_id": id });

        if (result?.deletedCount > 0)
            return 1;
        else
            return 0;
    }
}
