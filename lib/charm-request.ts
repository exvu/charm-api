import Request, { RequestMode } from './request';
import Response from './response';
import Headers from './header';

export function buildUrl(url: string): string {
    return (url).replace(/([^(https?:)])(\/)+/ig, '$1\/').replace(/\/\??$/, '\/');
}
export function doRequest(url: string, {
    method, headers, mode, onResponse, onRequest, timeout, data, xhr
}: {
        method: string, mode: RequestMode, headers: { [index: string]: string },
        onRequest: (req: Request, data: any) => any,
        onResponse: (res: Response) => any,
        data: { [index: string]: any },
        timeout: number,
        xhr: Function
    }): Promise<Response> {

    //创建请求对象
    let request = new Request(buildUrl(url), {
        method,
        headers: new Headers(headers),
        mode,
        body: method.toLocaleUpperCase() == 'GET' ? null : data
    });
    //调用onrequest
    onRequest(request, data);
    return doXmlHttpRequest(request, {
        onResponse, timeout, xhr
    });
}
export function doXmlHttpRequest(request: Request, { onResponse, timeout, xhr }: {
    onResponse: (res: Response) => any,
    timeout: number,
    xhr: Function
}): Promise<Response> {
    return new Promise((resolve, reject) => {
        try {
            let xmlHttp: XMLHttpRequest;
            //IE7以上
            if ('XMLHttpRequest' in window) {
                xmlHttp = new XMLHttpRequest();
            } else {
                xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            if (timeout) {
                xmlHttp.timeout = timeout;
            }
            //设置请求方法与请求地址
            xmlHttp.open(request.method, request.url, true);

            //调用xhr方法
            if (xhr) {
                if (Object.prototype.toString.call(xhr) != '[object Function]') {
                    reject("xhr必须是函数");
                } else {
                    xhr(xmlHttp);
                }
            }

            //存在请求头就设置请求头
            if (request.headers) {
                let headers = request.headers.entries();
                headers.forEach(([key, value]: any) => {
                    xmlHttp.setRequestHeader(key, value);
                });
            }
            xmlHttp.onreadystatechange = xmlHttp.onload = function onload() {
                try {
                    if (xmlHttp.readyState != 4) {
                        return;
                    }
                    let headers: any = {};
                    //获取response对象
                    xmlHttp.getAllResponseHeaders().split('\n').forEach(item => {
                        let index = item.indexOf(':');
                        if (index != -1) {
                            headers[item.substring(0, index)] = item.substr(index + 1).trim();
                        }
                    })
                    let res = new Response(xmlHttp.statusText, {
                        headers: new Headers(headers),
                        status: xmlHttp.status,
                        statusText: xmlHttp.statusText,
                    });
                    res = onResponse(res);
                    if (!(res instanceof Response)) {
                        reject("onResponse must return response object");
                    }
                    resolve(res);
                } catch (err) {
                    reject(err)
                }
            }
            xmlHttp.onerror = (err) => {
                reject(err)
            }
            xmlHttp.send(request._bodyInit || null);
        } catch (e) {
            reject(e);
        }
    });
};


