document.getElementById('form').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData();
    const fileField = document.querySelector('.form-input');

    formData.append('csvfile', fileField.files[0]);
    console.log(formData)
    fetch('http:localhost:3000/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        console.log('Success:', result);
        if(result.message === "success"){
                console.log("success on creation")
                let url = "csv/updates_shopify_customers.csv";
                let el = document.querySelector(".down")
                const a = document.createElement('a')
                a.href = url
                a.download = url.split('/').pop()
                el.appendChild(a)
                a.click()
                el.removeChild(a)
              
        }
        window.electronAPI.send('toMain', result);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});