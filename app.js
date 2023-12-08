async function fetchJSON(url) {
  const response = await fetch(url);
  const data = await response.json();
  data.terms_of_use.paragraphs.sort((a, b) => a.index - b.index);
  return data;
}

async function acceptTermsOfUse(termsOfUse) {
  try {
    const paragraphs = termsOfUse.terms_of_use.paragraphs;

    const text = document.getElementById('terms');
    text.innerHTML = '';

    paragraphs.forEach((paragraph, index) => {
      const termsContainer = document.createElement('div');
      const title = document.createElement('h3');
      const content = document.createElement('p');

      title.textContent = paragraph.title;
      content.textContent = paragraph.content;

      termsContainer.appendChild(title);
      termsContainer.appendChild(content);

      if (index === paragraphs.length - 1) {
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accept';
        acceptButton.addEventListener('click', async () => {
          localStorage.setItem('isTermsOfUseAccepted', 'true');
          window.location.hash = '#images';
        });
        termsContainer.appendChild(acceptButton);
      }

      terms.appendChild(termsContainer);
    });
  } catch (error) {
    console.error('Error loading:', error);
  }
}


async function renderImageToCanvas(imageUrl) {
  const canvasContainer = document.getElementById('terms');
  canvasContainer.innerHTML = '';

  for (const image of imageUrl) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const context = canvas.getContext('2d');
      context.drawImage(img, 0, 0);
      canvasContainer.appendChild(canvas);

      const saveButton = document.createElement('button');
      saveButton.textContent = 'Save';
      saveButton.addEventListener('click', () => {
        saveImage(image.image_url);
      });
      canvasContainer.appendChild(saveButton);
    };
    img.src = `http://167.71.69.158${image.image_url}`;
  }
}
function saveImage(canvas) {
  const link = document.createElement('a');
  link.href = canvas.toDataURL();
  link.download = imageUrl.slice(imageUrl.lastIndexOf('/') + 1);
  link.click();
}
async function handleRoute(route) {
  const termsOfUse = await fetchJSON('http://167.71.69.158/static/test.json');
  const imageUrl = termsOfUse.images;
  const termsAccepted = localStorage.getItem('isTermsOfUseAccepted');
  acceptTermsOfUse(termsOfUse);
  if (route === '#images' && termsAccepted) {
    renderImageToCanvas(imageUrl);
  }
}

function start() {
  const initialRoute = window.location.hash;
  handleRoute(initialRoute);

  window.addEventListener('hashchange', () => {
    const newRoute = window.location.hash;
    handleRoute(newRoute);
  });
}

start();

