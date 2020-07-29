//SERVICE WORKER REGISTRATION
if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('/Covid-Dashboard/sw.js')
        .then((reg) => console.log('service worker registered', reg))
        .catch((err) => console.log('service worker not registered', err))
}