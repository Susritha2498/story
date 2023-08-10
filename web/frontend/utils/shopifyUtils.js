import createApp from "@shopify/app-bridge";
import { Redirect } from "@shopify/app-bridge/actions";

import c from "../Constants/constant";

var called = false;
export const handleRedirection = async (permissionUrl) => {
  if (called) {
    console.log("deepak returning handleredirection");

    return;
  }
  console.log("deepak not returned handleredirection");
  called = true;
  var href = document.location.href;
  href = href.replace("?", "?a=b&");
  var params = new URLSearchParams(href);
  var params = new URLSearchParams(document.location.href);
  var shopOrigin = params.get("shop");
  if (window.top == window.self) {
    window.location.assign(permissionUrl);
  } else {
    console.log("deepak creating app");
    const app = createApp({
      apiKey: c.REACT_APP_SHOPIFY_APP_ID,
      shopOrigin: shopOrigin,

      host: btoa(`${shopOrigin}/admin`),
    });
    Redirect.create(app).dispatch(Redirect.Action.REMOTE, permissionUrl);
  }
};
