const REQUEST_TIMEOUT_SEC = 5;

const timeout = (sec) =>
  new Promise((_, reject) => {
    setTimeout(
      () => reject(Error(`Request timed out. Please try again later...`)),
      sec * 1000
    );
  });

export const useFetch = async (url, methodType, uploadData = null, type ) => {
  console.log("useFetch INSIDER",uploadData);
  
  let options;

  if (type === "profile") {
    
    const formData = new FormData();
    for (const name in uploadData) {
      formData.append(name, uploadData[name]);
    }

    options = { method: methodType, body: formData };
  }

  else {
    options = {
    method: methodType,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(uploadData),
  };
  console.log(options.method, options.body);

}


  try {
    const request = uploadData ? fetch(url, {...options}) : fetch(url);

    const response = await Promise.race([
      request,
      timeout(REQUEST_TIMEOUT_SEC),
    ]);

    const data = await response.json();

    if (!response.ok) throw Error(data.message);

    return data;
  } catch (error) {
    if (error.message === "Failed to fetch")
      error.message = `Unable to reach the server. Please check your internet connection...`;
    throw error;
  }
};

/*


export const useFetch = async(url, methodType, uploadData = null, type) => {
  console.log(uploadData);
  
  let options = { headers: { "Content-Type": "application/json" }, body: JSON.stringify(uploadData)};
  if(type === "updateMyData") options = { body: uploadData};

  console.log(options);
  
  try {
    const request = uploadData
      ? fetch(url, {
          method: methodType,
          options
        })
      : fetch(url);

    const response = await Promise.race([request, timeout(REQUEST_TIMEOUT_SEC)]);
    console.log(response);
    
    const data = await response.json();
    console.log(data);
    
    if (!response.ok) throw Error(data.message);

    return data;
  } catch (error) {
    if (error.message === "Failed to fetch")
      error.message = `Unable to reach the server. Please check your internet connection...`;
    throw error;
  }
};

*/
