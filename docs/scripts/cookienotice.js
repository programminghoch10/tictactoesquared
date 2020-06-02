function cookienotice() {
  if (cookiesAccepted()) {
    return
  }

  document.body.innerHTML +=
    `
  <div style="
    z-index: 9999;
    position: fixed;
    bottom: 0;
    display: flex;
    align-items: center;
    width: 100%;
    padding: 5px 40px;
    background-color: var(--default-alt);
    color: var(--font-color);
    font-size: 18px;
    -webkit-box-shadow: 0px -2px 5px 0px var(--dropshadow);
    -moz-box-shadow: 0px -2px 5px 0px var(--dropshadow);
    box-shadow: 0px -2px 5px 0px var(--dropshadow);
  " id="cookienotice"><p style="width: 100%; padding-right: 20px; text-align: center;">
    We use cookies to make sure you have a great experience playing.
    <a href="https://en.wikipedia.org/wiki/HTTP_cookie" style="color: var(--player1)" target="_blank">More info</a>
    </p>
    <div style="
      margin-left: auto;
      margin-right: 80px;
      padding: 10px 20px;
      background: var(--player2);
      border-radius: 10px;
      color: var(--background-color);
      cursor: pointer;
    " onclick="accept()">ACCEPT</div>
  </div>
  `

}

function accept() {
  setRawCookie("cookies-accepted", 1, cookiesavedays, "")
  document.getElementById("cookienotice").style.display = "none"
}

cookienotice()
