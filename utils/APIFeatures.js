const APIFeature = (request, response, model) => {

  console.log("INSIDE APIFEATURES");
      
    //In Mongoose version 6, the documentation indicates that by default,
    // Mongoose does not cast filter properties that aren't in your schema.
    //So it is not necessary to create queryObj and delete 'page', 'sort', 'limit', and 'fields'.
    // We can simply write:
    // console.log(typeof(request.query));
    // console.log({...request.query});

    let query = JSON.stringify({ ...request.query }); // convertin the obj to a string to manpulate it
    //The ? sign means that the previous character, in this case the 'e' letter could or not exists.
    query = query.replace(/\b(gte?|lte?)\b/g, (match) => `$${match}`);
    // console.log(typeof(query));
    // console.log(JSON.parse(query));
    // console.log(typeof(JSON.parse(query)));

    //find the result of search:
    query = model.find(JSON.parse(query)); // when we don't specify any thing inside find() it will return all the docs.

    // 2) implemnting sort query on results we got :
    if (request.query.sort) {
      // splitting all of the sort cretiria and rejoin it witha space between them instead of comma.
      const sortBy = request.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      // default sort if there was none
      query = query.sort("-createdAt _id");
    }

    // 3) fields limiting :
    if (request.query.fields) {
      const fields = request.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      // default sort if there was none
      // excluding this data which mongo generates it and mongoose uses it but we don't need it>
      query = query.select("-__v");
    }

    // 4) pagination :
    // || means bu defualt we need page 1.
    const page = +request.query.page || 1;
    const limit = +request.query.limit || 15;
    // if I want page 3 (from element 31 - 46),
    // then it will be 2 * 15 = 30 elements to skip .
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    return query;

}

module.exports = APIFeature;