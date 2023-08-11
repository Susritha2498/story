// import fetch from "../../fetch";
import c from "../../Constants/constant";
import fetch, { fetchWithoutGroupId } from "../../utils/fetch";
import { handleRedirection } from "../../utils/shopifyUtils";

export const doOAuthInit = async (oAuthState) => {
  var params = new URLSearchParams(docUrl());
  console.log("deepak ishmac", params.has("hmac"));
  var isOAuthInit = params.has("hmac") && !params.has("code");
  if (isOAuthInit) {
    var shop = params.get("shop");
    var session = params.get("session");
    var hmac = params.get("hmac");
    var returnHere = docUrl().split("?")[0];
    var newUrl =
      "https://" +
      shop +
      "/admin/oauth/authorize?client_id=" +
      c.REACT_APP_SHOPIFY_APP_ID +
      "&scope=unauthenticated_read_content,unauthenticated_read_customer_tags,unauthenticated_read_product_tags,unauthenticated_read_product_inventory,unauthenticated_read_product_listings,unauthenticated_write_checkouts,unauthenticated_read_checkouts,unauthenticated_write_customers,unauthenticated_read_customers,read_product_listings,read_inventory,read_products,write_script_tags,write_orders,read_price_rules" +
      "&redirect_uri=" +
      encodeURI(returnHere) +
      "&state=" +
      oAuthState.shopify_nonce;
    handleRedirection(newUrl);
  }
  var params2 = new URLSearchParams(newUrl);
  return params2.get("code");
};

export const doOAuthComplete = async (oAuthState, code) => {
  var params = new URLSearchParams(docUrl());
  var isOAuthCompleteFlow = params.has("hmac") && params.has("code");
  if (isOAuthCompleteFlow) {
    var code = params.get("code");
    var hmac = params.get("hmac");
    var shop = params.get("shop");

    let baseURL = `${c.STORY_API}/public/authShopify`
      const body = {
  id: "75319015608394267632505313505",
  email: "susritha.balusu@borderfree.io",
  time: "60",
    }
      let tokenResp =  await fetchWithoutGroupId(
          "post",
          `${baseURL}`,
          "application/json",
          body,
          {},
          {"group-id":12,
          Authorization:"xyz"
        });
      localStorage.setItem("storyToken", tokenResp.data?.token);
      const storyToken = tokenResp.data?.token
    await fetch(
      "POST",
      "/shopsadmin",
      shop + "_storeFrontAccessTokens",
      "application/json",
      {
        shop: shop,
        hmac: hmac,
        code: code,
        nonce: oAuthState.shopify_nonce.toString(),
      },
      {},
      {Authorization: storyToken,
        "group-id":12,
    },
      undefined,
      false
    )
      .then((resp) => {
      const addShopify = (
         fetchWithoutGroupId(
          "post",
          `${c.STORY_API}/add/shopifyStore`,
          "application/json",
          resp.data,
          {
            "storeUrl":shop
          },
          {
            Authorization: storyToken,
            "group-id":12
          },
          undefined,
          false,
        ))
        console.log("Data is",addShopify.data)
        return true;
      })
      .catch((err) => {
        return false;
      });
    var returnHere = docUrl().split("?")[0];
    var newUrl =
      "https://" + shop + "/admin/apps/story-test-1/?new_design_language=true";
    if (shop && shop != "") {
      handleRedirection(newUrl);
    } else {
      handleRedirection(c.ADMIN_URL);
    }
    return true;
  }
};

export const getOAuthState = async () => {
  var params = new URLSearchParams(docUrl());
  var shop = params.get("shop");
  var hmac = params.get("hmac");
  if (!hmac && !shop) {
    console.log("deepak not authflow");
    return {};
  }
   const body = {
      id: "75319015608394267632505313505",
      email: "susritha.balusu@borderfree.io",
      time: "60",
    };
  let baseURL = `${c.STORY_API}/public/authShopify`;
      let tokenResp =  await fetchWithoutGroupId(
         "post",
        `${baseURL}`,
        "application/json",
        body,
        {},
        { "group-id": 12,
      Authorization:"xyz" }
      );
      localStorage.setItem("storyToken", tokenResp.data?.token);
      const storytoken = tokenResp.data?.token;
  var oAuthState;
  console.log("fetching status of oauth...", encodeURI(shop));
  await fetch(
    "GET",
    "/shopsadmin?shop=" + encodeURI(shop),
      shop + "_storeFrontAccessTokens",
    "application/json",
    {},
    {},
     {
            Authorization: storytoken,
            "group-id":12
          },
          undefined,
          false
  )
    .then((resp) => {
      oAuthState = resp.data;
    })
    .catch((err) => {
      alert("unexpected error", err);
    });
  return oAuthState;
};

export const docUrl = () => {
  return document.location.href.replace("?", "?x=y&");
};

export const popupWindow = (url, windowName, win, w, h) => {
  const y = win.outerHeight / 2 + win.screenY - h / 2;
  const x = win.outerWidth / 2 + win.screenX - w / 2;
  return window.open(
    url,
    windowName,
    `toolbar=yes, location=no, directories=no, status=no, menubar=yes, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`
  );
};
