export default {
    "/category": {
        "post": {
            "tags": ["Category"],
            "summary": "Category",
            "description": "Category",
            "produces": [
                "application/json"
            ],
            "parameters": [
                {
                    "name": "email",
                    "in": "formData",
                    "description": "email",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "password",
                    "in": "formData",
                    "description": "password",
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