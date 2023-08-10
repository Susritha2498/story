import axios from "axios";
import c from "../Constants/constant";

const fetch = async (
  method,
  path,
  groupID,
  content_type,
  data,
  params,
  headers,
  cancelToken,
  isAuthenticated = true
) => {
  if (!method) throw new Error("Method is a required field.");
  if (!path) throw new Error("Path is a required field.");
  if (!groupID) throw new Error("groupID is a required field.");
  if (!content_type)
    throw new Error("content_type is required field for a request.");

  const options = {
    cancelToken,
    method: method.toUpperCase(),
    baseURL: c.STORY_API,
    url: path,
    data: data || {},
    params: params || {},
    timeout: 250000,
    headers: {
      "Content-Type": content_type,
      "user-access-token": "",
      "group-id": groupID,
      ...headers,
    },
  };

  console.log("options is ",options)
  return axios(options);
};

export const fetchWithoutGroupId = async (
  method,
  path,
  content_type,
  data,
  params,
  headers,
  cancelToken,
  isAuthenticated = true
) => {
  if (!method) throw new Error("Method is a required field.");
  if (!path) throw new Error("Path is a required field.");
  if (!content_type)
    throw new Error("content_type is required field for a request.");

  const options = {
    cancelToken,
    method: method.toUpperCase(),
    baseURL: c.STORY_API,
    url: path,
    data: data || {},
    params: params || {},
    timeout: 250000,
    headers: {
      "Content-Type": content_type,
      ...headers,
    },
  };
  console.log("options is ",options)

  return axios(options);
};

const cancelToken = () => axios.CancelToken.source();

export default fetch;
