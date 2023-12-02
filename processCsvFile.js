const fs = require('fs');
let shopCu = []
function csvToObject(csvString) {
    const rows = csvString.split("\n");
    const headers = rows[0].split(",");

    return rows.slice(1).map(row => {
        const values = row.split(",");
        return headers.reduce((object, header, index) => {
            object[header] = values[index];
            return object;
        }, {});
    });
}

// fs.readFile('csv/customers_epos.csv', 'utf8', (err, data) => {
//     if (err) {
//         console.error("Error reading the file:", err);
//         return;
//     }
//     const objects = csvToObject(data);
//     const custsWithEmail = getCustomersWithEmails(objects);
//     // console.log(custsWithEmail); 
//     readShopifyTemp()
//     .then(objects => {
//         createShopifyNewCust(custsWithEmail, objects)
//     })
//     .catch(error => {
//         console.error("Error reading the file:", error);
//     });
// });
function processCsvFile(){
    // fs.readFile('uploads/customers_epos.csv', 'utf8', (err, data) => {
    //     if (err) {
    //         console.error("Error reading the file:", err);
    //         return;
    //     }
    //     const objects = csvToObject(data);
    //     const custsWithEmail = getCustomersWithEmails(objects);
    
    //     readShopifyTemp()
    //     .then(shopifyObjects => {
    //         createShopifyNewCust(custsWithEmail, shopifyObjects)
    //     })
    //     .catch(error => {
    //         console.error("Error reading the file:", error);
    //     });
    // });
    return new Promise((resolve, reject) => {
        fs.readFile('uploads/customers_epos.csv', 'utf8', (err, data) => {
            if (err) {
                reject("Error reading the file: " + err);
                return;
            }
            const objects = csvToObject(data);
            const custsWithEmail = getCustomersWithEmails(objects);

            // Assuming readShopifyTemp and createShopifyNewCust return Promises
            readShopifyTemp()
            .then(shopifyObjects => {
                createShopifyNewCust(custsWithEmail, shopifyObjects);
                resolve();
            })
            .catch(error => {
                reject("Error processing Shopify template: " + error);
            });
        });
    });

}

function getCustomersWithEmails(data) {
    return data.filter(customer => customer.Email && customer.Email.trim() !== '""');
}

function createShopifyNewCust(eposCustomers, shopifyCustomers){
     // Implementation for creating Shopify template
     // take epos now last name first name email and add to shopify last night firstname email 
     // Set shopify customers accepts email marketing to yes
    eposCustomers.forEach(eposCustomer => {
        // Assuming eposCustomer has fields like FirstName, LastName, Email
        // Find or create a matching customer in Shopify data
        let shopifyCustomer = shopifyCustomers.find(sCustomer => sCustomer.Email === eposCustomer.Email);
        if (!shopifyCustomer) {
            // Create a new customer object
            shopifyCustomer = {
                'First Name': eposCustomer['First name'] || '',  // Fallback to empty string if undefined
                'Last Name': eposCustomer['Last name'] || '',
                'Email': eposCustomer.Email || '',
                'Accepts Email Marketing': 'Yes'
            };
            shopifyCustomers.push(shopifyCustomer);
        } else {
            // Update existing customer
            shopifyCustomer['First Name'] = eposCustomer['First name'] || shopifyCustomer['FirstName'];
            shopifyCustomer['Last Name'] = eposCustomer['Last name'] || shopifyCustomer['LastName'];
            shopifyCustomer['Accepts Email Marketing'] = 'Yes';
        }
    });

    // console.log("EPOS Customers: ", eposCustomers);
    console.log("Shopify Customers: ", shopifyCustomers);
    shopCu = shopifyCustomers; // Update the global shopCu variable
    saveShopifyCustomersAsCsv(shopCu, 'csv/updated_shopify_customers.csv'); 
}
function readShopifyTemp() {
    return new Promise((resolve, reject) => {
        fs.readFile('csv-temp/customer_template.csv', 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            const objects = csvToObject(data);
            resolve(objects);
        });
    });
}

function arrayToCsv(data) {
    // Extract headers
    const headers = Object.keys(data[0]);
    const csvRows = data.map(row => headers.map(header => JSON.stringify(row[header], replacer)).join(','));
    
    // Combine headers and rows
    return [headers.join(',')].concat(csvRows).join('\n');
}

function replacer(key, value) {
    return value === null ? '' : value; // Handle null values
}

function saveShopifyCustomersAsCsv(customers, filename) {
    const csvData = arrayToCsv(customers);
    fs.writeFile(filename, csvData, 'utf8', (err) => {
        if (err) {
            console.error("Error writing to CSV file:", err);
            return;
        }
        console.log(`Shopify customers saved to ${filename}`);
    });
}


module.exports = {
    processCsvFile, // The main function that processes the CSV file
    // Any other functions you might need to export
};
