import {
  ILoadingScreen,
} from 'babylonjs';

export class LoadingScreen implements ILoadingScreen {
  public loadingUIText: string;
  public loadingUIBackgroundColor: string;
  public preloader: HTMLElement;

  constructor(text: string = 'Loading ...') {
    this.loadingUIText = text;
    this.loadingUIBackgroundColor = '#333333';

    let preloader = document.getElementById('preloader');
    if (!preloader) {
      preloader = document.createElement('div');
      preloader.id = 'preloader';
      preloader.style.transition = 'opacity 1s ease';
      preloader.style.pointerEvents = 'none';
      preloader.style.display = 'none';
      preloader.style.background = '#000000';
      preloader.style.color = '#ffffff';
      preloader.style.textAlign = 'center';
      preloader.style.fontSize = '32px';
      preloader.style.padding = '100px 20px';
      preloader.style.boxSizing = 'border-box';
      preloader.style.opacity = '1';
      preloader.style.position = 'absolute';
      preloader.style.top = '0';
      preloader.style.left = '0';
      preloader.style.width = '100%';
      preloader.style.height = '100%';
      preloader.style.zIndex = '9999';

      document.body.appendChild(preloader);
    }

    preloader.innerHTML = this.loadingUIText;

    this.preloader = preloader;
  }

  public displayLoadingUI() {
    this.preloader.style.opacity = '1';
    this.preloader.style.display = 'block';
  }

  public hideLoadingUI() {
    this.preloader.style.opacity = '0';
    setTimeout(() => {
      this.preloader.style.display = 'none';
    }, 1000);
  }
}
