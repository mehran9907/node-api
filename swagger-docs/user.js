export default {
    "/user/login": {
        "post": {
            "tags": ["Users"],
            "summary": "User Login",
            "description": "Perform login operation",
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
    },
    "/user/profile": {
        "get": {
            "tags": ["Users"],
            "summary": "User Get Profile",
            "description": "User get profile",
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
                }
            ],
            "responses": {
                "200": {
                    "description": "successful",
                },
            }
        }
    },
    "/user/refresh-token": {
        "post": {
            "tags": ["Users"],
            "summary": "User Refresh Token",
            "description": "Get Token",
            "produces": [
                "application/json"
            ],
            "parameters": [
                {
                    "name": "access_token",
                    "in": "formData",
                    "description": "Access Token",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "refresh_token",
                    "in": "formData",
                    "description": "Refresh Token",
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
    "/user/logout": {
        "get": {
            "tags": ["Users"],
            "summary": "User Logout",
            "description": "Logout user using token",
            "produces": [
                "application/json"
            ],
            "parameters": [
                {
                    "name": "x-token",
                    "in": "header",
                    "description": "User's token",
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
    "/user/upload-avatar": {
        "put": {
            "tags": ["Users"],
            "summary": "Avatar update",
            "description": "Update user avatar",
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
                    "name": "avatar",
                    "in": "formData",
                    "description": "User Avatar",
                    "required": false,
                    "type": "file"
                }
            ],
            "responses": {
                "200": {
                    "description": "successful",
                },
            }
        }
    },
    "/user/delete-avatar": {
        "delete": {
            "tags": ["Users"],
            "summary": "Avatar Remove",
            "description": "Remove user avatar",
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
                }
            ],
            "responses": {
                "200": {
                    "description": "successful",
                },
            }
        }
    },
    "/user/update-profile": {
        "put": {
            "tags": ["Users"],
            "summary": "Update user profile",
            "description": "Update user profile",
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
                    "name": "first_name",
                    "in": "formData",
                    "description": "User first name",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "last_name",
                    "in": "formData",
                    "description": "User last name",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "email",
                    "in": "formData",
                    "description": "User email",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "current_password",
                    "in": "formData",
                    "description": "User old password",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "new_password",
                    "in": "formData",
                    "description": "User new password",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "new_password_confirm",
                    "in": "formData",
                    "description": "User new password confirmation",
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