const {  parentPort, workerData } = require('worker_threads');

let interval;
let index = -1;

registerForEventListening();

function registerForEventListening () {

    let cb = (err, result) => {
        if(err) return console.error(err);

        console.log("**** Multiple Factor Received From Parent Thread: ", result.multipleFactor, " ****");

        //  setting up interval
        interval = setInterval(processDataAndSendData, 3000, result.multipleFactor);
    };

    //you can receive messages from the main thread this way:
    parentPort.on('error', cb);
    parentPort.on('message', (msg) => {
        cb(null, msg);
    });
}

function processDataAndSendData (multipleFactor) {

    // updating index
    index++;
    // now check first length
    if( workerData.length > index) {
        // update value
        workerData[index] = workerData[index] * multipleFactor;
        // send notification
        parentPort.postMessage({ index, val: workerData[index], isInProgress:true });
    } else {
        // send notification
        parentPort.postMessage({ val: workerData, isInProgress:false });
        clearInterval(interval);
    }
}
