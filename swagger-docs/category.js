export default {
    "/category/": {
        "get": {
            "tags": ["Category"],
            "summary": "Get all categories",
            "description": "Get all categories",
            "produces": [
                "application/json"
            ],
            "parameters": [
                {
                    "name": "x-token",
                    "in": "header",
                    "description": "user token",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "page",
                    "in": "query",
                    "description": "page",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "sort_type",
                    "in": "query",
                    "description": "Sort type",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "sort_field",
                    "in": "query",
                    "description": "Sort field",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "parent_id",
                    "in": "query",
                    "description": "Parent ID",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "title",
                    "in": "query",
                    "description": "Title",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "limit",
                    "in": "query",
                    "description": "limit",
                    "required": false,
                    "type": "string"
                }
            ],
            "responses": {
                "200": {
                    "description": "successful",
                },
            }
        }
    },
    "/category/show/{id}": {
        "get": {
            "tags": ["Category"],
            "summary": "Get category by id",
            "description": "Get category by id",
            "produces": [
                "application/json"
            ],
            "parameters": [
                {
                    "name": "x-token",
                    "in": "header",
                    "description": "user token",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "id",
                    "in": "path",
                    "description": "Category id",
                    "required": false,
                    "type": "string"
                }
            ],
            "responses": {
                "200": {
                    "description": "successful",
                },
            }
        }
    },
    "/category/change-status/{id}": {
        "put": {
            "tags": ["Category"],
            "summary": "Change single category status",
            "description": "Change single category status",
            "produces": [
                "application/json"
            ],
            "parameters": [
                {
                    "name": "x-token",
                    "in": "header",
                    "description": "user token",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "id",
                    "in": "path",
                    "description": "Category id",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "status",
                    "in": "formData",
                    "description": "status",
                    "enum":[
                        "0",
                        "1"
                    ],
                    "required": false,
                    "type": "string"
                }
            ],
            "responses": {
                "200": {
                    "description": "successful",
                },
            }
        }
    },
    "/category/update/{id}": {
        "put": {
            "tags": ["Category"],
            "summary": "Update a category",
            "description": "Update a category",
            "produces": [
                "application/json"
            ],
            "parameters": [
                {
                    "name": "x-token",
                    "in": "header",
                    "description": "user token",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "id",
                    "in": "path",
                    "description": "Category id",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "parent_id",
                    "in": "formData",
                    "description": "Category parent ID",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "title",
                    "in": "formData",
                    "description": "Category title",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "title_seo",
                    "in": "formData",
                    "description": "Category seo title",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "description_seo",
                    "in": "formData",
                    "description": "Category seo description",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "status",
                    "in": "formData",
                    "description": "category status",
                    "enum":[
                        "0",
                        "1"
                    ],
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "slug",
                    "in": "formData",
                    "description": "category slug",
                    "required": false,
                    "type": "string"
                }
            ],
            "responses": {
                "200": {
                    "description": "successful",
                },
            }
        }
    },
    "/category/remove/{id}": {
        "delete": {
            "tags": ["Category"],
            "summary": "Remove a category",
            "description": "Remove a category",
            "produces": [
                "application/json"
            ],
            "parameters": [
                {
                    "name": "x-token",
                    "in": "header",
                    "description": "user token",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "id",
                    "in": "path",
                    "description": "Category id",
                    "required": false,
                    "type": "string"
                }
            ],
            "responses": {
                "200": {
                    "description": "successful",
                },
            }
        }
    },
    "/category/add": {
        "post": {
            "tags": ["Category"],
            "summary": "Add a new category",
            "description": "Add new category",
            "produces": [
                "application/json"
            ],
            "parameters": [
                {
                    "name": "x-token",
                    "in": "header",
                    "description": "user token",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "parent_id",
                    "in": "formData",
                    "description": "parent id",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "title",
                    "in": "formData",
                    "description": "title",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "title_seo",
                    "in": "formData",
                    "description": "seo title",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "description_seo",
                    "in": "formData",
                    "description": "seo description",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "slug",
                    "in": "formData",
                    "description": "Category slug",
                    "required": false,
                    "type": "string",
                    "enum": [
                        "1",
                        "0"
                    ]
                },
                {
                    "name": "status",
                    "in": "formData",
                    "description": "Category status",
                    "required": false,
                    "type": "string"
                }
            ],
            "responses": {
                "200": {
                    "description": "successful",
                },
            }
        }
    }
};