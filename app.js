const host = "http://167.71.69.158";
const dataPath = "/static/test.json";

async function fetchTermsOfUse(url) {
  const response = await fetch(url);
  const data = await response.json();
  data.terms_of_use.paragraphs.sort((a, b) => a.index - b.index);
  return data;
}

async function acceptTermsOfUse(termsOfUse)  {
  const root = document.getElementById('root');
  root.innerHTML = '';
  const paragraphs = termsOfUse.terms_of_use.paragraphs;
  paragraphs.forEach((paragraph, index) => {
    const textWrapper = document.createElement('div');
    const title = document.createElement('h3');
    const content = document.createElement('p');

    title.textContent = paragraph.title;
    content.textContent = paragraph.content;

    textWrapper.appendChild(title);
    textWrapper.appendChild(content);

    if (index === paragraphs.length - 1) {
      const acceptButton = document.createElement('button');
      acceptButton.textContent = 'Accept';
      acceptButton.addEventListener('click', async () => {
      await renderImageGallery(termsOfUse.images);
      });
      textWrapper.appendChild(acceptButton);
    }
    root.appendChild(textWrapper);
  });
}

async function renderImageGallery(images) {
  const canvasContainer = document.getElementById('root');
  canvasContainer.innerHTML = '';

  const canvasPromises = images.map(async (image) => {
    try {
      const imageUrl = `${host}${image.image_url}`;
      const canvasWrapper = document.createElement('div');

      const canvas = await renderImageToCanvas(imageUrl);
      canvasWrapper.appendChild(canvas);

      const saveButton = document.createElement('button');
      saveButton.textContent = 'Save';
      saveButton.addEventListener('click', () => {
        saveImage(canvas, imageUrl.split('/').pop());
      });
      canvasWrapper.appendChild(saveButton);
      canvasContainer.appendChild(canvasWrapper);
    } catch (error) {
      console.error('Error rendering image:', error);
    }
  });

  await Promise.all(canvasPromises);
}
function createImageGallery() {
  const galleryContainer = document.getElementById('root');
  const galleryWrapper = document.createElement('div');
  galleryContainer.appendChild(galleryWrapper);
}

async function renderImageToCanvas(imageUrl) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = function () {
      canvas.width = this.width;
      canvas.height = this.height;
      context.drawImage(image, 0, 0, this.width, this.height);
      resolve(canvas);
    };
    image.onerror = () => {
      reject(new Error('Image failed to load'));
    };
    image.src = imageUrl;
  });
}

async function saveImage(canvas, imageName) {
  const canvasUrl = canvas.toDataURL();
  const imageDownloadLink = document.createElement("a");
  imageDownloadLink.href = canvasUrl;
  imageDownloadLink.download = imageName;
  imageDownloadLink.click();
  imageDownloadLink.remove();
};

async function start() {
  const termsOfUse = await fetchTermsOfUse(host + dataPath);
  createImageGallery();
  await acceptTermsOfUse(termsOfUse);
}

start();