function getSpeedWithAjax(url) {
    return new Promise((resolve, reject) => {
        let start = null;
        let end = null;
        start = new Date().getTime();
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                end = new Date().getTime();
                const size = xhr.getResponseHeader("Content-Length") / 1024;
                const speed = (size * 1000) / (end - start);
                resolve(speed);
            }
        };
        xhr.open("GET", url);
        xhr.send();
    }).catch((err) => {
        throw err;
    });
}
getSpeedWithAjax(
    "http://pic.qianye88.com/pic/3b37326942b783af4568ef78afd2164e.jpg?imageMogr2/thumbnail/x300/quality/90!"
).then((res) => console.log(res));
