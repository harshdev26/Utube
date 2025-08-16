class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        error = [],
        statck = ""
    ){

        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors  = this.errors 
    
        if (statck) {
            this.stack = statck
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    
    }
}

export {ApiError}


/*


Chalo, ab tumhari ApiError.js ka breakdown karte hain step-by-step, taki tumhe pata chale ki yeh kaise kaam karta hai.

Code ka Structure
Tumhara code roughly kuch aisa hai (main formatting thoda clean kar raha hoon):

js
Copy
Edit
class ApiError extends Error {
    constructor(statusCode, message, errors = [], stack) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;
Step-by-Step Explanation
1. Class Definition
js
Copy
Edit
class ApiError extends Error {
ApiError ek custom error class hai.

Ye JavaScript ke built-in Error class ko extend karta hai.

Iska matlab tum throw new ApiError(...) kar ke apne error messages ko custom format me bhej sakte ho.

2. Constructor
js
Copy
Edit
constructor(statusCode, message, errors = [], stack) {
Constructor parameters:

statusCode → HTTP status code (e.g., 404, 500).

message → Error ka description.

errors → Extra details ya validation errors ka array.

stack → Agar manually stack trace dena ho.

3. super(message)
js
Copy
Edit
super(message);
Ye parent class (Error) ka constructor call karta hai.

Isse message property aur built-in error behavior set ho jata hai.

4. Properties Set Karna
js
Copy
Edit
this.statusCode = statusCode;
this.data = null;
this.message = message;
this.success = false;
this.errors = errors;
statusCode → Client ko kaunsa HTTP status code bhejna hai.

data = null → Error hone par data nahi hota.

message → Error ka description.

success = false → API fail ho gayi.

errors → Additional error details (e.g., form validation errors).

5. Stack Trace Handling
js
Copy
Edit
if (stack) {
    this.stack = stack;
} else {
    Error.captureStackTrace(this, this.constructor);
}
stack error hone ka trace hota hai (kaunsa file, kaunsa line number).

Agar stack manually diya gaya hai toh use kar lega.

Warna Error.captureStackTrace() se automatically stack generate karega.

Example Usage
js
Copy
Edit
const ApiError = require("./utils/ApiError");

app.get("/test", (req, res, next) => {
    next(new ApiError(404, "Resource not found", ["User ID invalid"]));
});
Isse middleware me error catch hoga aur JSON response me tumhara custom format return hoga:

json
Copy
Edit
{
    "statusCode": 404,
    "data": null,
    "message": "Resource not found",
    "success": false,
    "errors": ["User ID invalid"]
}
Mujhe lagta hai tumhare code me ek small bug hai — tum this.errors = this.errors likh rahe ho, jo galat hai.
Tumhe this.errors = errors likhna chahiye, warna errors property hamesha undefined rahegi.

Agar tum chaho toh main tumhe iska error handling middleware ka example bhi de sakta hoon jo tumhare ApiError ke saath kaam karega, taki pure backend me uniform error response aaye.
Kya main bana du?





Ask ChatGPT















*/