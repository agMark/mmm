
/**
 * 
 * @param {string} route Example: "/loadDocDef/"
 * @param {RequestInit} request  
 * @param {(arg0: Object) => void} successCallback 
 * @param {(arg0: any|null) => void} failureCallback 
 */
function myFetch(route, request, successCallback, failureCallback){
    fetch(route, request)
    .then(response => {
        if (!response.ok) {
            if(failureCallback){
                failureCallback(`HTTP error! status: ${response.status}`)
            }
            else{
                throw "Failure Callback not set."
            }
        }
        return response.json();
    })
    .then(data => {
        if(successCallback){
            successCallback(data);
        }
        else{
            throw "Failure Callback not set."
        }
    })
    .catch(error => {
        if(failureCallback){
            failureCallback(error)
        }
        else{
            throw "Failure Callback not set."
        }
    });
}

export {myFetch}