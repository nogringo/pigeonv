const textarea = document.getElementById("myTextarea");
let rHashed;

Gun.on('opt', function (ctx) {
  if (ctx.once) {
    return
  }
  // Check all incoming traffic
  ctx.on('in', function (msg) {
    var to = this.to
    // restrict put
    if (msg.put) {
      let storeData = Object.keys(msg.put)[0] == rHashed;
      if (storeData) to.next(msg);
    } else {
      to.next(msg);
    }
  });
});

// Initialize Gun
const gun = Gun([
  'https://gun-manhattan.herokuapp.com/gun',
  'https://try.axe.eco/gun',
  'https://test.era.eco/gun',
  'https://peer.wallie.io/gun',
]);

// Extract the 'r' parameter from the URL
function getUrlParameter(name) {
  const regex = new RegExp('[?&]' + name + '=([^&#]*)');
  const results = regex.exec(window.location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function generateRandomString(length) {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz23456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function addRandomStringToUrl() {
  const randomString = generateRandomString(64); // Random string of 8 characters
  const currentUrl = window.location.href.split('?')[0]; // Remove any existing parameters
  const newUrl = `${currentUrl}?r=${randomString}`;
  window.history.replaceState({}, '', newUrl);
}

function changeRoom() {
  addRandomStringToUrl();
  location.reload(); // Reload the page to apply the new 'r' value
}

function copyToClipboard() {
  textarea.select();
  textarea.setSelectionRange(0, 99999); // For mobile devices
  document.execCommand("copy");
  alert("Text has been copied!");
}

async function hashString(string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function generateColorFromHash(hash) {
  const color1 = `#${hash.slice(0, 6)}`;
  const color2 = `#${hash.slice(6, 12)}`;
  return { color1, color2 };
}

window.onload = async function () {
  let rValue = getUrlParameter('r');
  if (!rValue) {
    addRandomStringToUrl();
    rValue = getUrlParameter('r');
  }

  rHashed = await hashString(rValue);
  const { color1, color2 } = generateColorFromHash(rHashed);

  document.documentElement.style.setProperty('--dynamic-color-1', color1);
  document.documentElement.style.setProperty('--dynamic-color-2', color2);

  const textareaRef = gun.get(rHashed);

  textarea.addEventListener('input', async () => {
    const text = await SEA.encrypt(textarea.value, rValue);
    textareaRef.put({ text: text });
  });

  textareaRef.on(async data => {
    const text = await SEA.decrypt(data.text, rValue);
    if (text !== textarea.value) {
      textarea.value = text;
    }
  });
};