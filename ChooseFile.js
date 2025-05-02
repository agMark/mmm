//@ts-check

function testFetch() {
    fetch('/loadDocDef/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Data received:', data);
        
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}
