import { asyncHandler } from "../utils/asyncHandler.js" // after writing this we not have to write try and catch block everytime..


const registerUser = asyncHandler( async (req, res) => {  //registerUser: it is writing the function of register the user and asynchandler is just handling any kind of error, which
    // takes the parameters with the async function.
    res.status(200).json({ // sending the statement to the user using res.status(200) that everything is ok!.
        message: "Kaise ho harsh bhai????"
    })
})


export  {
    
    registerUser
}