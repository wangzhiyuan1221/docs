"use strict";
!function() {
    let e = e=>e
      , t = document.currentScript
      , n = (null == t ? void 0 : t.dataset.endpoint) || (null != t && t.src.includes("/va/") ? "/va" : "/_vercel/insights");
    async function i({type: i, data: o, options: a}) {
        var r, l;
        let c = location.href
          , d = document.referrer
          , s = e({
            type: i,
            url: c
        });
        if (!1 === s || null === s)
            return;
        s && (c = s.url);
        let u = d.includes(location.host)
          , f = {
            o: c,
            sv: "0.1.2",
            sdkn: null != (r = null == t ? void 0 : t.getAttribute("data-sdkn")) ? r : void 0,
            sdkv: null != (l = null == t ? void 0 : t.getAttribute("data-sdkv")) ? l : void 0,
            ts: Date.now(),
            ...null != a && a.withReferrer && !u ? {
                r: d
            } : {},
            ..."event" === i && o && {
                en: o.name,
                ed: o.data
            }
        };
        try {
            await fetch(`${n}/${"pageview" === i ? "view" : "event"}`, {
                method: "POST",
                keepalive: !0,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(f)
            })
        } catch (h) {}
    }
    async function o(e={}) {
        return i({
            type: "pageview",
            options: {
                withReferrer: e.withReferrer
            }
        })
    }
    async function a(e, t) {
        return i({
            type: "event",
            data: {
                name: e,
                data: t
            },
            options: {
                withReferrer: !0
            }
        })
    }
    async function r() {
        await fetch(`${n}/session`, {
            method: "GET",
            keepalive: !0
        }).catch(()=>{}
        )
    }
    function l(e) {
        return e.pathname === new URL(d).pathname
    }
    function c(e) {
        let t = e ? "string" == typeof e ? new URL(e,location.origin) : new URL(e.href) : null;
        !t || l(t) || Boolean(t.hash) && l(t) || o()
    }
    let d = location.href
      , s = ()=>{
        var t;
        window.va = function(t, n) {
            "beforeSend" === t ? e = n : "event" === t && n && a(n.name, n.data),
            "enableCookie" === t && r()
        }
        ,
        null == (t = window.vaq) || t.forEach(([e,t])=>{
            window.va(e, t)
        }
        )
    }
    ;
    (()=>{
        if (window.vai)
            return;
        window.vai = !0,
        s(),
        o({
            withReferrer: !0
        });
        let e = history.pushState.bind(history);
        history.pushState = function(...t) {
            e(...t),
            c(t[2]),
            d = location.href
        }
        ,
        window.addEventListener("popstate", function() {
            c(location.href),
            d = location.href
        })
    }
    )()
}();
