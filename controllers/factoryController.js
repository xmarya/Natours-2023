 /*
    these methods here are going to RETURN controllers
 */

const AppError = require("../utils/appError");
const APIFeatures = require("../utils/APIFeatures");

const catchAsync = asyncFunction => {
    return (request, response, next ) => {
        asyncFunction(request, response, next ).catch (error => {
            console.log(error);
            next(error);
        });
    }
}

/*
    this one is going to delete a doc from any model.
*/
exports.deleteOne = Model => catchAsync (async (request, response, next) => {
    const doc = await Model.findByIdAndDelete(request.params.id);

    if(!doc) return next(new AppError(404, "No document is associated with this id"));

    response.status(204).json({
        status: "success",
        data: null
    });
});

exports.updateOne = Model => catchAsync(async (request, response, next) => {
     // if(+(request.params.id) > tours.length) {
  //     return response.status(404).json({
  //         statur: "fail",
  //         message: "invalid id"
  //     });
  // }

    const doc = await Model.findByIdAndUpdate(
        request.params.id,
        request.body,
        { new: true, runValidators: true }
        ); // new: true means the updated doc it is the one which will be returned no the old one.
  
        if(!doc) return next(new AppError(404,"No document is associated with this id"));
          
      
      response.status(200).json({
        status: "success",
        data: {
          doc,
        },
      });
});

exports.createOne = Model => catchAsync( async(request, response, next) => {
    const doc = await Model.create(request.body);

    response.status(200).json({
        status: "success",
        doc
    });
});

exports.getAll = Model => catchAsync( async(request, response, next) => {
    
    const query = APIFeatures(request,response,Model);
    // const tours = await query.populate({path: "guides", select: "-__v -changedPasswordAt"});
    const docs = await query;
    // const docs = await query.explain();
    
    response.status(200).json({
      status: "success", // or fail (when somtheing happens at the client side) or error (when somtheing happens server side).
      result: docs.length,
      data: {
        // the actual data we wanna send to the client .
        docs // no need to write the key if it has the same name as variable.
      },
    });
});

exports.getOne = (Model, popOp) => catchAsync( async(request, response, next) => {
    // const doc = await Model.findbyId(request.params.id).populate(popOp);
     
    // نحفظ المتغيرات الي عندنا في فيريبل و بعدها نسوي له أوايت بدل ما نسوي أوايت مرتين 
    // لأننا من الأساس ما نعرف إذا عندنا بوبيوليت أوبشن أو لا عشان ننفذ الخطوة من مرة وحدة
    let query = Model.findById(request.params.id);
    // console.log(query);
    
    if(popOp) query = query.populate(popOp).exec();
    
    const doc = await query;

    if(!doc) return next(new AppError(404,"No document is associated with this id"));
  
    response.status(200).json({
        status: "success",
        doc,
    });
});