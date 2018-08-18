// parentPort for registering to events from main thread
// workerData for receiving data clone
const {  parentPort, workerData } = require('worker_threads');

let interval;
let index = -1;

registerForEventListening();

function registerForEventListening () {

    // callback method is defined to receive data from main thread
    let cb = (err, result) => {
        if(err) return console.error(err);

        console.log("**** Multiple Factor Received From Parent Thread: ", result.multipleFactor, " ****");

        //  setting up interval to call method to multiple with factor
        interval = setInterval(processDataAndSendData, 3000, result.multipleFactor);
    };

    // registering to events to receive messages from the main thread
    parentPort.on('error', cb);
    parentPort.on('message', (msg) => {
        cb(null, msg);
    });
}

// item of list will be multiplied with a factor as per index
function processDataAndSendData (multipleFactor) {

    // updating index
    index++;
    // now check first length
    if( workerData.length > index) {
        // update value
        workerData[index] = workerData[index] * multipleFactor;
        // send updated value as notification along with in progress flag as true
        parentPort.postMessage({ index, val: workerData[index], isInProgress:true });
    } else {
        // send complete updated list as notification, when processing is done
        parentPort.postMessage({ val: workerData, isInProgress:false });
        clearInterval(interval);
    }
}
