import {
  AppProvider,
  Card,
  Button,
  HorizontalGrid,
  EmptyState,
  FooterHelp,
  Layout,
  Link,
  List,
  Icon,
  Page,
  SettingToggle,
  Spinner,
  TextStyle,
  Text,
  HorizontalStack,
} from "@shopify/polaris";
import { QuestionMarkMajor } from "@shopify/polaris-icons";
// import "@shopify/polaris/dist/styles.css";
import "@shopify/polaris/build/esm/styles.css";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  doOAuthComplete,
  doOAuthInit,
  getOAuthState,
} from "../Features/ShopifyOAuth/ShopifyOAuth";
import fetch, { fetchWithoutGroupId } from "../utils/fetch";
import c from "../Constants/constant";
import { handleRedirection } from "../utils/shopifyUtils";
import "./HomePage.scss";

export default function HomePage(props) {
  const [showLoader, setShowLoader] = useState(true);
  const [iferror, setiferror] = useState(false);
  // const [OrgName, setOrgName] = useState("");
  const [URLHasCode, setURLHasCode] = useState(false);
  const [isOauthComplete, setIsOauthComplete] = useState(false);
  const [shopURL, setShopURL] = useState("");
  const [isConnected, setisConnected] = useState(false);
  const [orglist, setorglist] = useState([]);
  const [integrationToken, setintegrationToken] = useState("");

  const docUrl = () => {
    return document.location.href.replace("?", "?a=b&");
  };

  const disconnectShop = async (org) => {
    await fetch(
      "patch",
      `/disconnectshop?id=${org}`,
      "organization_org_registration",
      "application/json",
      {
        integration_token: integrationToken,
      }
    )
      .then(() => {
        document.location.href = document.location.href;
        console.log("shop disconnected");
        setisConnected(false);
      })
      .catch((e) => {
        console.log("err", e);
      })
      .finally(() => {
        setisConnected(false);
      });
  };

  useEffect(() => {
    (async () => {
      var params = new URLSearchParams(docUrl());
      var shop = params.get("shop"); 
      let baseURL = `${c.STORY_API}/public/authShopify`;
       const body = {
      id: "75319015608394267632505313505",
      email: "susritha.balusu@borderfree.io",
      time: "60",
    };
       let tokenResp = await fetchWithoutGroupId(
           "post",
        `${baseURL}`,
        "application/json",
        body,
        {},
        { "group-id": 12 ,
        Authorization:"xyz"
     }
      );
      localStorage.setItem("storyToken", tokenResp.data?.token);
      const storyToken = tokenResp.data?.token;
      const brandList = (
        await fetchWithoutGroupId(
          "get",
          `${c.STORY_API}/store/details?storeUrl=${shop}`,
          "application/json",
          {},
          {},
          {
            "group-id":12,
            "authorization": storyToken,
          }
        )
      )?.data?.data;
      if (brandList) {
        setorglist(()=>[brandList]);
        setisConnected(true);
      }
    })();
  }, []);

  useEffect(() => {
    var params = new URLSearchParams(docUrl());
    console.log("deepak hasShop", params.has("shop"));
    // HMACvalidation(params.get("shop").split(".")[0]);
    setShopURL(params.get("shop"));
    if (params.has("code")) {
      console.log("deepak hasCode, setting code state");
      setURLHasCode(true);
    }

    getOAuthState().then((oAuthState) => {
      console.log("deepak oauthstate", oAuthState);
      var isOauthSuccess;
      if (oAuthState.status == "OAUTH_INIT") {
        console.log("deepak", oAuthState.status);
        doOAuthInit(oAuthState).then(async (code) => {
          console.log("deepak code", code);
          isOauthSuccess = await doOAuthComplete(oAuthState, code);
          console.log("deepak is0authSuccess", isOauthSuccess);
          if (isOauthSuccess === false) {
            if (params.has("code")) {
              setiferror(true);
            }
            setShowLoader(false);
            setIsOauthComplete(true);
          }
        });
      } else {
        console.log("deepak authcomplete");
        setShowLoader(false);
        setIsOauthComplete(true);
        setintegrationToken(oAuthState.integration_token);
        var newUrl =
          "https://" +
          params.get("shop") +
          "/admin/apps/story-test-1/?new_design_language=true";
        if (window.top == window.self && params.has("shop")) {
          console.log("deepak redirect if");
          handleRedirection(newUrl);
        } else if (!params.has("shop")) {
          console.log("deepak redirect else");
          handleRedirection(c.ADMIN_URL);
        }
      }
    });
  }, []);
  if (!isOauthComplete) {
    return <div>doing auth....</div>;
  }

  return (
    <div className="custom-page">
      {showLoader && 
        (<div className="spinner">
          <Spinner accessibilityLabel="Spinner example" size="large" />
        </div> 
     )}
      {showLoader !== true && !iferror && (
        <Page>
          <Text variant="heading2xl" as="h1">
            Welcome to Revo App
          </Text>
          <Layout>
            <Layout.AnnotatedSection
              title="Revo Account"
              description="Connect your shop to start selling on our marketplace."
            >
              {orglist?.length ? (
                orglist.map((org) => (
                  <Card sectioned>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ flex: "1" }}>
                        Your Shopify store is connected to '<b>{org.handle}</b>'
                        Revo account
                      </div>
                      <Button size="small">Connected</Button>
                    </div>
                  </Card>
                ))
              ) : (
                <Card sectioned>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ flex: "1" }}>
                      Please connect your Shopify store to a Revo account.
                    </div>
                    <Button
                      size="small"
                      onClick={() => {
                        window.open(
                          c.ADMIN_URL +
                            `/auth?group-id=${shopURL}&to-connect=true&token=${integrationToken}`
                        )
                      }}
                    >
                      Connect
                    </Button>
                  </div>
                </Card>
              )}
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
              title="Revo Account"
              description="Connect your shop to start selling on our marketplace."
            >
              <Card sectioned>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: "1" }}>
                    Create an event and invite users to your live show. By
                    clicking on create event you are agreeing to the{" "}
                    <Link
                      removeUnderline
                      onClick={() => window.open("https://app.storyplayer.io/terms")}
                    >
                      Terms and Conditions
                    </Link>
                    .
                  </div>
                  <Button
                    size="small"
                    primary
                    disabled={isConnected}
                    onClick={() => window.open(c.ADMIN_URL + `/products`)}
                    style={{ backgroundColor: "#FF0000" }}
                  >
                    Launch App
                  </Button>
                </div>
              </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
              title="Terms and Conditions"
              description="The terms and conditions for selling products on Revo."
            >
              <Card sectioned>
                <List>
                  <List.Item>
                    <Link
                      removeUnderline
                      onClick={() => window.open("https://app.storyplayer.io/terms")}
                    >
                      Terms and Conditions
                    </Link>
                  </List.Item>
                  <List.Item>
                    <Link
                      removeUnderline
                      onClick={() =>
                        window.open("https://app.storyplayer.io/privacy")
                      }
                    >
                      Privacy Policy
                    </Link>
                  </List.Item>
                </List>
              </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
              title="Subscription and Commission Rate
                                "
              description="Details of subscription and commission from Revo App."
            >
              <Card title="Following Plans are available:">
                <Card.Section title="Basic">
                  <List>
                    <List.Item>
                      This basic plan is available for a trial period of 30
                      days.
                    </List.Item>
                    <List.Item>
                      Free to use. A 5% transaction fee per sale will be
                      collected.
                    </List.Item>
                    <List.Item>Revo branding</List.Item>
                    <List.Item>3 shows per month</List.Item>
                    <List.Item>2 on-screen</List.Item>
                    <List.Item>Welcome Page</List.Item>
                    <List.Item>Live sales</List.Item>
                    <List.Item>Share on Social Media</List.Item>
                  </List>
                </Card.Section>
                <Card.Section title="Standard +">
                  <List>
                    <List.Item>$10 / month </List.Item>
                    <List.Item>
                      Features: Everything in Basic plan {"&"}{" "}
                    </List.Item>
                    <List.Item>Unlimited streaming</List.Item>
                    <List.Item>4 On-screen participants</List.Item>
                    <List.Item>Access to recordings</List.Item>
                  </List>
                </Card.Section>
              </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
              title="How to Uninstall the app"
              description="Here are the steps on how to uninstall the app."
            >
              <Card
                title="To uninstall the Revo app follow these steps:"
                sectioned
                subdued
              >
                <List type="number">
                  <List.Item>
                    Click on <TextStyle variation="strong">settings</TextStyle>{" "}
                    on the left bottom corner of the dashboard
                  </List.Item>
                  <List.Item>
                    Click on{" "}
                    <TextStyle variation="strong">Sales Channels</TextStyle>
                  </List.Item>
                  <List.Item>
                    Find in the list the Revo app and click on remove icon
                  </List.Item>
                </List>
              </Card>
            </Layout.AnnotatedSection>
          </Layout>
        </Page>
      )} 
      {showLoader !== true && iferror && (
        <EmptyState
          heading="Oops..."
          image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
        >
          <p>Some error occurred. Please try again...</p>
        </EmptyState>
      )}
      <Layout.Section>
        <FooterHelp>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "0.1rem solid #dfe3e8",
              padding: "20px",
              borderRadius: "999px",
            }}
          >
            {" "}
            <Icon source={QuestionMarkMajor} color="highlight" />
            <div style={{ marginLeft: "15px" }}>
              For additional support, please refer to this page{" "}
              <Link
                removeUnderline
                onClick={() => window.open("https://app.storyplayer.io/contact")}
              >
                storyplayer.contact
              </Link>
            </div>
          </div>
          .
        </FooterHelp>
      </Layout.Section>
    </div>
  );
}
