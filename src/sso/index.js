let PREFIX_URL = ""
const CLIENT_ID = "web_demo";
// current url 
// not support query
const STATE = (window.location.href).split('?')[0]
if(AREA == 'internal') {
  PREFIX_URL = "https://sso.shengwang.cn"
}else{
  PREFIX_URL ="https://sso2.agora.io"
}
const SSO_URL = `${PREFIX_URL}/api/v0/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=basic_info&state=${STATE}`;

function _param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
}

function _isAvailableToken() {
  const data = JSON.parse(localStorage.getItem("agora_sso_data"))
  if (!data || !data.access_token) {
    return false
  }
  return true
}

function _isFreshToken() {
  const data = JSON.parse(localStorage.getItem("agora_sso_data"))
  const now = new Date().getTime();
  const expireTime = data.time || 0;
  return now < expireTime && data.access_token
}

async function _refreshToken() {
  const data = JSON.parse(localStorage.getItem("agora_sso_data"))
  const { refresh_token } = data;
  const url = `${BASE_URL}/v1/webdemo/sso/refresh_token`
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token
    })
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.code === 0) {
        return res.data
      } else {
        localStorage.clear('agora_sso_data')
        window.location.href = SSO_URL;
        throw res
      }
    })
    .catch((err) => {
      localStorage.clear('agora_sso_data')
      window.location.href = SSO_URL;
      throw err
    });
}

async function _getTokenData(code) {
  const url = `${BASE_URL}/v1/webdemo/sso/access_token`
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code
    })
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.code === 0) {
        return res.data
      } else {
        throw res
      }
    })
    .catch((err) => {
      throw err
    });
}

async function agoraSSOLogin() {
  const { code, loginId, state } = _param2Obj(window.location.href);
  if (code && loginId) {
    const data = await _getTokenData(code)
    data.time = new Date().getTime() + data.expires_in * 1000;
    data.loginId = loginId;
    localStorage.setItem("agora_sso_data", JSON.stringify(data));
    window.location.href = state;
  } else if (!_isAvailableToken()) {
    window.location.href = SSO_URL;
  } else {
    if (!_isFreshToken()) {
      const data = await _refreshToken()
      data.time = new Date().getTime() + data.expires_in * 1000;
      const preData = JSON.parse(localStorage.getItem("agora_sso_data"));
      localStorage.setItem("agora_sso_data", JSON.stringify({
        ...preData,
        ...data
      }));
    }
  }
}

async function agoraSSOLogout() {
  localStorage.clear('agora_sso_data')
  window.location.href = "https://sso2.agora.io/api/v0/logout"
}

if (AREA == 'internal') {
  agoraSSOLogin();
} 


