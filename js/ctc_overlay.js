/*
 * 
 * 
 * 
 * CTC Gallery Viewer
 *  images in overlay carousel and gallery written in vanilla js
 * https://ujwolbastakoti.wordpress.com/
 * MIT license
 * 
 * 
 * 
 */


"use strict";
class ctcOverlayViewer {

	constructor(sel, param2) {
		Array.from(document.querySelectorAll(sel)).forEach((el, i) => this.prepareGal(el, i, param2));
		window.addEventListener('resize', event => this.adjustApp(event));
		window.addEventListener('keydown', event => this.onKeyStroke(event));
	}
	/*
	*Prepare gallery for viewing
	* 
	*@param gal  All of the images of agllery
	*@param param2 for future extension
	*
	*/
	prepareGal(gal, param2) {
		let imgs = Array.from(gal.querySelectorAll('img'));
		imgs.forEach((img, imgNum) => {
			img.addEventListener('click', event => {
				this.createOverlay(event.target, imgNum, imgs, param2);
			});
		});
	}

	/*
	*Create overlay for viewing
	* 
	*@param img Iamges clicked
	*@param imgNum Number of image in gallery
	*@param gal Array of images in gallery
	*@param param2 For future extension
	*
	*/

	createOverlay(img, imgNum, gal, param2) {

		let overlayWidth = window.innerWidth + 1;
		let overlayHeight = window.innerHeight + 1;
		let alltImgWidth = 1 < gal.length ? 0.94 : 1;
		let sideBarWid = 1 < gal.length ? 0.04 : 0;


		let scrollCss = document.createElement('style');
		scrollCss.id = 'ctc-scroll-css';
		scrollCss.innerHTML = `::-webkit-scrollbar-track {background: rgba(255, 255, 255, 1);} ::-moz-scrollbar-track { background: rgba(255, 255, 255, 1);} #gal-sidebar::-webkit-scrollbar {display: none;} #gal-sidebar::-moz-scrollbar {display: none;}`;
		document.querySelector('head').appendChild(scrollCss);
		document.body.style.overflow = 'hidden';

		let overlayDivEl = document.createElement("div");
		overlayDivEl.id = "gallery-overlay";
		overlayDivEl.style = `position:fixed;height:${overlayHeight}px;width:${overlayWidth}px;background-color:rgba(0,0,0,.6);z-index:100000;top:0%;left:0%;right:0%;bottom:0%;`;
		document.body.insertBefore(overlayDivEl, document.body.firstChild);



		let closeBtn = document.createElement('span');
		closeBtn.id = "overlay-close-btn";
		closeBtn.title = "Close";
		closeBtn.innerHTML = "&#10539;";
		closeBtn.style = `cursor:pointer;position:absolute;float:right;right:3px;font-size:${0.016 * overlayWidth}px;color:rgba(255,255,255,1);text-shadow:-1px -1px 1px rgba(0,0,0,1);z-index:200000;`;
		overlayDivEl.appendChild(closeBtn);
		closeBtn.addEventListener('click', () => this.closeOverlay());

		let imgLoading = document.createElement('span');
		imgLoading.id = 'image-loading-main';
		imgLoading.style = `left:${0.992 * overlayWidth / 2};top:${overlayHeight / 2};font-size:${0.016 * overlayWidth}px;display:inline-block;position:fixed;color:rgba(255,255,255,1);`;
		imgLoading.innerHTML = 'Loading';
		overlayDivEl.appendChild(imgLoading);
		let loadingInt = setInterval(() => {
			switch (imgLoading.innerHTML) {
				case 'Loading':
					imgLoading.innerHTML = 'Loading<b>.</b>'
					break;
				case 'Loading<b>.</b>':
					imgLoading.innerHTML = 'Loading.<b>.</b>'
					break;
				case 'Loading.<b>.</b>':
					imgLoading.innerHTML = 'Loading..<b>.</b>'
					break;
				case 'Loading..<b>.</b>':
					imgLoading.innerHTML = 'Loading...<b>.</b>'
					break;
				case 'Loading...<b>.</b>':
					imgLoading.innerHTML = 'Loading<b>.</b>'
					break;
			}
		}, 350);

		let imgEl = document.createElement('img');
		let loadedImg = new Image();
		loadedImg.src = img.src;
		imgEl.id = 'loaded-img';
		imgEl.src = img.src;
		imgEl.style.display = 'none';
		let opImgDim = this.getOptimizedImageSize(overlayWidth, overlayHeight, loadedImg.width, loadedImg.height, gal.length);

		loadedImg.addEventListener('load', (event) => {
			clearInterval(loadingInt);
			imgLoading.style.display = 'none';
			imgEl.style = `z-index:180000;height:${opImgDim.height}px;width:${opImgDim.width}px;display:inline-block;margin:${((overlayHeight - opImgDim.height) / 2)}px ${(((alltImgWidth * overlayWidth) - opImgDim.width) / 2)}px;`;
			imgEl.title = undefined != img.getAttribute('title') || null != img.getAttribute('title') ? img.getAttribute('title') : '';
		});
		overlayDivEl.appendChild(imgEl);

		let imgTitleDiv = document.createElement("div");
		imgTitleDiv.id = "img-title-info";
		imgTitleDiv.style = `z-index:195000;position:fixed;text-align:center;height:${0.02 * overlayHeight}px;width:${opImgDim.width}px;bottom:1px;color:rgba(255,255,255,1);font-size:${0.015 * overlayHeight};left:${(sideBarWid * overlayWidth) + (((alltImgWidth * overlayWidth) - opImgDim.width) / 2)}px;`;
		imgTitleDiv.innerHTML = undefined != img.getAttribute('title') || null != img.getAttribute('title') ? img.getAttribute('title') : '';
		overlayDivEl.appendChild(imgTitleDiv);

		if (1 < gal.length) {
			this.createToolbar(overlayDivEl, gal, imgEl, imgNum, param2);
			this.createSidebar(overlayDivEl, gal, imgEl, imgNum, param2);
			imgEl.addEventListener('click', event => {
				if (event.offsetX > (event.target.offsetWidth / 2)) {
					document.querySelector('#gal-next-img').click();
				} else {
					document.querySelector('#gal-prev-img').click();
				}
			});
		}
	}

	/*
	*Create toolbar 
	* 
	*@param overlayDivEl Overlay div element
	*@param gal Array of images in gallery
	*@param imgEl Image element in overlay
	*@param imgNum Number of image in gallery
	*@param param2 For future extension
	*
	*/
	createToolbar(overlayDivEl, gal, imgEl, imgNum, param2) {
		let toolbarDiv = overlayDivEl.querySelector('#toolbar-div');
		let ovWidth = overlayDivEl.offsetWidth;
		let ovHeight = overlayDivEl.offsetHeight;
		let btnStyle = `height:${0.02 * ovWidth}px;width:${0.02 * ovWidth}px;text-align:center;font-size:${0.016 * ovWidth}px;cursor:pointer;color:rgba(255,255,255,1);border-radius:${0.02 * ovWidth}px;margin-top:${0.002 * ovWidth}px;background-color:rgba(0,0,0,0.8);`;

		if (undefined == toolbarDiv) {
			let toolbarDiv = document.createElement('div');
			toolbarDiv.id = 'toolbar-div';
			toolbarDiv.style = `top:${(ovHeight / 2) - (0.066 * ovWidth)}px;float:right;right: 0px;display: inline-block;position: fixed;`;

			let prevBtn = document.createElement('div');
			prevBtn.id = 'gal-prev-img';
			prevBtn.style = btnStyle;
			prevBtn.innerHTML = '&#60;';
			prevBtn.title = 'Previous image';
			prevBtn.addEventListener('click', () => {
				let imgNumToLoad = 0 <= imgNum - 1 ? imgNum - 1 : gal.length - 1;
				this.loadImg(imgNumToLoad, gal, overlayDivEl, imgEl);
			});
			prevBtn.addEventListener('mouseenter', event => {
				event.target.style.fontWeight = 'bolder';
			});
			prevBtn.addEventListener('mouseleave', event => {
				event.target.style.fontWeight = '';
			});
			toolbarDiv.insertBefore(prevBtn, toolbarDiv.firstChild);

			let firstImgBtn = document.createElement('div');
			firstImgBtn.id = 'gal-first-img';
			firstImgBtn.style = btnStyle + 'transform:rotate(-90deg);';
			firstImgBtn.innerHTML = '&#8892;';
			firstImgBtn.title = 'Go to first image';
			firstImgBtn.addEventListener('click', () => this.loadImg(0, gal, overlayDivEl, imgEl));
			firstImgBtn.addEventListener('mouseenter', event => {
				event.target.style.fontWeight = 'bolder';

			});
			firstImgBtn.addEventListener('mouseleave', event => {
				event.target.style.fontWeight = '';
			});
			toolbarDiv.appendChild(firstImgBtn);

			let zoomInBtn = document.createElement('div');
			zoomInBtn.id = 'img-zoom-in';
			zoomInBtn.style = btnStyle;
			zoomInBtn.innerHTML = '&#43;';
			zoomInBtn.title = 'Zoom in';
			zoomInBtn.addEventListener('click', () => imgEl.style.transform = 0 === imgEl.style.transform.length ? `scale(1.2)` : `scale(${parseFloat(imgEl.style.transform.replace('scale(', '').replace(')', '')) + 0.2})`);
			zoomInBtn.addEventListener('mouseenter', event => {
				event.target.style.fontWeight = 'bolder';

			});
			zoomInBtn.addEventListener('mouseleave', event => {
				event.target.style.fontWeight = '';
			});
			toolbarDiv.appendChild(zoomInBtn);

			let zoomOutBtn = document.createElement('div');
			zoomOutBtn.id = 'img-zoom-out';
			zoomOutBtn.style = btnStyle;
			zoomOutBtn.innerHTML = '&#8722;';
			zoomOutBtn.title = 'Zoom out';
			zoomOutBtn.addEventListener('click', () => {
				let zoom = parseFloat(imgEl.style.transform.replace('scale(', '').replace(')', '')) - 0.2;
				let scale = 0 > zoom ? 0.1 : zoom;
				imgEl.style.transform = 0 === imgEl.style.transform.length ? `scale(0.8)` : `scale(${scale})`
			});
			zoomOutBtn.addEventListener('mouseenter', event => {
				event.target.style.fontWeight = 'bolder';

			});
			zoomOutBtn.addEventListener('mouseleave', event => {
				event.target.style.fontWeight = '';
			});
			toolbarDiv.appendChild(zoomOutBtn);

			let lastImgBtn = document.createElement('div');
			lastImgBtn.id = 'gal-last-img';
			lastImgBtn.style = btnStyle + 'transform:rotate(90deg);';
			lastImgBtn.innerHTML = '&#8892;';
			lastImgBtn.title = 'Go to last image';
			lastImgBtn.addEventListener('click', () => this.loadImg((gal.length - 1), gal, overlayDivEl, imgEl));
			lastImgBtn.addEventListener('mouseenter', event => {
				event.target.style.fontWeight = 'bolder';
			});
			lastImgBtn.addEventListener('mouseleave', event => {
				event.target.style.fontWeight = '';
			});
			toolbarDiv.appendChild(lastImgBtn);



			let nextBtn = document.createElement('div');
			nextBtn.id = 'gal-next-img';
			nextBtn.style = btnStyle;
			nextBtn.innerHTML = '&#62;';
			nextBtn.title = 'Next image';
			nextBtn.addEventListener('click', () => {
				let imgNumToLoad = gal.length - 1 >= imgNum + 1 ? imgNum + 1 : 0;
				this.loadImg(imgNumToLoad, gal, overlayDivEl, imgEl);
			});
			nextBtn.addEventListener('mouseenter', event => {
				event.target.style.fontWeight = 'bolder';
				event.target.style.backgroundColor = 'bolder';
			});
			nextBtn.addEventListener('mouseleave', event => {
				event.target.style.fontWeight = '';
			});
			toolbarDiv.appendChild(nextBtn);
			overlayDivEl.appendChild(toolbarDiv);



		} else {

			let imgLoading = overlayDivEl.querySelector('#image-loading-main');
			if (undefined != imgLoading) {
				overlayDivEl.removeChild(imgLoading);
			}

			toolbarDiv.removeChild(document.querySelector('#gal-prev-img'));
			toolbarDiv.removeChild(document.querySelector('#gal-next-img'));

			let prevBtn = document.createElement('div');
			prevBtn.id = 'gal-prev-img';
			prevBtn.style = btnStyle;
			prevBtn.innerHTML = '&#60;';
			prevBtn.title = 'Previous image';
			prevBtn.addEventListener('click', () => {
				let imgNumToLoad = 0 <= imgNum - 1 ? imgNum - 1 : gal.length - 1;
				this.loadImg(imgNumToLoad, gal, overlayDivEl, imgEl);
			});
			prevBtn.addEventListener('mouseenter', event => {
				event.target.style.fontWeight = 'bolder';

			});
			prevBtn.addEventListener('mouseleave', event => {
				event.target.style.fontWeight = '';
				event.target.style.boxShadow = "rgba(0,0,0,0.5)";
			});
			toolbarDiv.insertBefore(prevBtn, toolbarDiv.firstChild);

			let nextBtn = document.createElement('div');
			nextBtn.id = 'gal-next-img';
			nextBtn.style = btnStyle;
			nextBtn.innerHTML = '&#62;';
			nextBtn.title = 'Next image';
			nextBtn.addEventListener('click', () => {
				let imgNumToLoad = gal.length - 1 >= imgNum + 1 ? imgNum + 1 : 0;
				this.loadImg(imgNumToLoad, gal, overlayDivEl, imgEl);
			});
			nextBtn.addEventListener('mouseenter', event => {
				event.target.style.fontWeight = 'bolder';
			});
			nextBtn.addEventListener('mouseleave', event => {
				event.target.style.fontWeight = '';
			});
			toolbarDiv.appendChild(nextBtn);
		}
	}


	/*
	*Create sidebar of images
	* 
	*@param overlayDivEl Overlay div element
	*@param gal Array of images in gallery
	*@param imgEl Image element in overlay
	*@param imgClicked Image cliecked to trigger overlay
	*@param param2 For future extension
	*
	*/

	createSidebar(overlayDiv, gal, imgEl, imgClicked, param2) {
		let sidebar = document.createElement('div');
		sidebar.id = `gal-sidebar`;
		sidebar.style = `overflow-y:auto;tex-align:center;display:inline-block;width:${0.04 * overlayDiv.offsetWidth}px;height:${overlayDiv.offsetHeight}px;float:left;left:0;background-color:rgba(0,0,0,0.1);z-index:105000;`;
		overlayDiv.appendChild(sidebar);

		let sidebarImgStyle = ` overflow-x: hidden;border-radius:5%;cursor:pointer;background-color:rgba(255,255,255,1);width:93%;height:${0.93 * sidebar.offsetWidth}px;border:1px solid rgba(0,0,0,0.8);background-repeat: no-repeat;background-size:contain;background-position: center;text-align:center;color:rgba(0,0,0,1);font-size:${0.6 * sidebar.offsetWidth}px;`;
		gal.map((img, i) => {

			let imgPrev = new Image();
			imgPrev.src = img.src;

			let sidebarImg = document.createElement('div');
			sidebarImg.classList.add('img-preview');
			sidebarImg.title = undefined != img.getAttribute('title') || null != img.getAttribute('title') ? img.getAttribute('title') : '';
			sidebarImg.style = sidebarImgStyle;
			sidebarImg.addEventListener('mouseenter', event => event.target.style.borderRadius = '12%');
			sidebarImg.addEventListener('mouseleave', event => event.target.style.borderRadius = '5%');
			sidebarImg.innerHTML = `<b>.</b>`;
			sidebar.appendChild(sidebarImg);
			let rotateInterval = setInterval(() => {
				switch (sidebarImg.innerHTML) {
					case '<b>.</b>':
						sidebarImg.innerHTML = '<b>.</b>.'
						break;
					case '<b>.</b>.':
						sidebarImg.innerHTML = '.<b>.</b>.'
						break;
					case '.<b>.</b>.':
						sidebarImg.innerHTML = '...<b>.</b>'
						break;
					case '...<b>.</b>':
						sidebarImg.innerHTML = '<b>.</b>'
						break;
					default:
				}
			}, 250);

			imgPrev.addEventListener('load', (event) => {
				clearInterval(rotateInterval);
				sidebarImg.innerHTML = '';
				sidebarImg.style.backgroundImage = `url('${event.target.src}')`;
			});

			sidebarImg.addEventListener('click', () => this.loadImg(i, gal, overlayDiv, imgEl));
		});

		this.scrollToPrev(imgClicked);
		sidebar.style.paddingTop = 0 < (overlayDiv.offsetHeight - (gal.length * ((0.93 * sidebar.offsetWidth) + 2))) / 2 ? `${(overlayDiv.offsetHeight - (gal.length * ((0.93 * sidebar.offsetWidth) + 2))) / 2}px` : `0px`;
	}

	/*
	*Load image clicked on sidebar
	* 
	*@param imgNum Number of image on gallery
	*@param gal Array of images in gallery
	*@param overlayDiv Overlay div element
	*@param imgEl Image element in overlay
	*
	*/
	loadImg(imgNum, gal, overlayDiv, imgEl) {

		var clickedImg = new Image();
		clickedImg.src = gal[imgNum].src;
		imgEl.src = gal[imgNum].src;
		imgEl.style.display = 'none';

		let imgLoading = document.createElement('span');
		imgLoading.id = 'image-loading-main';
		imgLoading.style = `left:${0.992 * overlayDiv.offsetWidth / 2};top:${overlayDiv.offsetHeight / 2};font-size:${0.016 * overlayDiv.offsetWidth}px;display:inline-block;position:fixed;color:rgba(255,255,255,1);`;
		imgLoading.innerHTML = 'Loading';
		overlayDiv.appendChild(imgLoading);

		let loadingInt = setInterval(() => {
			switch (imgLoading.innerHTML) {
				case 'Loading':
					imgLoading.innerHTML = 'Loading<b>.</b>'
					break;
				case 'Loading<b>.</b>':
					imgLoading.innerHTML = 'Loading.<b>.</b>'
					break;
				case 'Loading.<b>.</b>':
					imgLoading.innerHTML = 'Loading..<b>.</b>'
					break;
				case 'Loading..<b>.</b>':
					imgLoading.innerHTML = 'Loading...<b>.</b>'
					break;
				case 'Loading...<b>.</b>':
					imgLoading.innerHTML = 'Loading<b>.</b>'
					break;
				default:
			}
		}, 350);

		let opImgDim = this.getOptimizedImageSize(overlayDiv.offsetWidth, overlayDiv.offsetHeight, clickedImg.width, clickedImg.height, gal.length);
		clickedImg.addEventListener('load', () => {
			clearInterval(loadingInt);
			imgLoading.style.display = 'none';
			imgEl.style = `z-index:180000;height:${opImgDim.height}px;width:${opImgDim.width}px;display:inline-block;margin:${((overlayDiv.offsetHeight - opImgDim.height) / 2)}px ${(((0.94 * overlayDiv.offsetWidth) - opImgDim.width) / 2)}px;`;
			imgEl.title = undefined != gal[imgNum].getAttribute('title') || null != gal[imgNum].getAttribute('title') ? gal[imgNum].getAttribute('title') : '';
		});
		let titleEl = document.querySelector('#img-title-info');
		titleEl.innerHTML = undefined != gal[imgNum].getAttribute('title') || null != gal[imgNum].getAttribute('title') ? gal[imgNum].getAttribute('title') : '';
		titleEl.style.width = opImgDim.width + 'px';
		titleEl.style.left = (0.04 * overlayDiv.offsetWidth) + (((0.94 * overlayDiv.offsetWidth) - opImgDim.width) / 2) + 'px';
		this.createToolbar(overlayDiv, gal, imgEl, imgNum);
		this.scrollToPrev(imgNum);
	}

	/*
	*Scroll loaded image on side bar
	* 
	*@param imgNum Number of image on gallery
	*
	*/
	scrollToPrev(imgNum) {
		Array.from(document.querySelectorAll('.img-preview')).forEach((prev, i) => {

			if (i === imgNum) {
				prev.scrollIntoView({ block: "center" });
				prev.style.border = `1px solid rgba(255, 0, 0, 0.8)`;

			} else {
				prev.style.border = `1px solid rgba(0,0,0,0.8)`;
			}
		});
	}

	/*
	*Adjust element dimension on resize
	* 
	*@param e Resize event
	*
	*/

	adjustApp(e) {
		let overlayWidth = window.innerWidth;
		let overlayHeight = window.innerHeight;
		let overlayDiv = document.querySelector('#gallery-overlay');


		if (undefined != overlayDiv) {
			let closeBtn = overlayDiv.querySelector('#overlay-close-btn');
			overlayDiv.style.height = `${overlayHeight}px`;
			overlayDiv.style.width = `${overlayWidth}px`;
			closeBtn.style.fontSize = `${0.016 * overlayWidth}`;
			let loadedImg = document.querySelector('#loaded-img');
			let sidebarDiv = document.querySelector('#gal-sidebar');
			let imgCount = undefined != sidebarDiv ? 2 : 1;
			let alltImgWidth = undefined != sidebarDiv ? 0.94 : 1;
			let sideBarWid = undefined != sidebarDiv ? 0.04 : 0;

			let imgLoading = overlayDiv.querySelector('#image-loading-main');
			imgLoading.style.left = `${0.992 * overlayWidth / 2}`;
			imgLoading.style.top = `${overlayHeight / 2}`;
			imgLoading.style.fontSize = `${0.016 * overlayWidth}px`

			let bufferImg = new Image();
			bufferImg.src = loadedImg.src;
			let opImgDim = this.getOptimizedImageSize(overlayWidth, overlayHeight, bufferImg.width, bufferImg.height, imgCount);
			let imgDisplay = loadedImg.style.display;
			loadedImg.style = `height:${opImgDim.height}px;width:${opImgDim.width}px;display:${imgDisplay};margin:${((overlayHeight - opImgDim.height) / 2)}px ${(((alltImgWidth * overlayWidth) - opImgDim.width) / 2)}px;`;

			let titleEl = document.querySelector('#img-title-info');
			titleEl.style.width = opImgDim.width + 'px';
			titleEl.style.height = (0.02 * overlayHeight) + 'px';
			titleEl.style.left = (sideBarWid * overlayWidth) + (((alltImgWidth * overlayWidth) - opImgDim.width) / 2) + 'px';
			titleEl.style.fontSize = 0.015 * overlayHeight + 'px';

			if (undefined != sidebarDiv) {
				let sidebarImgs = Array.from(sidebarDiv.querySelectorAll('div'));
				sidebarDiv.style.height = overlayHeight + 'px';
				sidebarDiv.style.width = (0.04 * overlayWidth) + 'px';
				sidebarDiv.style.paddingTop = 0 < (overlayHeight - (sidebarImgs.length * ((0.93 * sidebarDiv.offsetWidth) + 2))) / 2 ? `${(overlayHeight - (sidebarImgs.length * ((0.93 * sidebarDiv.offsetWidth) + 2))) / 2}px` : '0px';
				sidebarImgs.map(y => {
					y.style.height = (0.93 * sidebarDiv.offsetWidth) + 'px';
					y.style.fontSize = `${0.6 * sidebarDiv.offsetWidth}px`;
				});

				let toolbarDiv = overlayDiv.querySelector('#toolbar-div');
				toolbarDiv.style = `top:${(overlayHeight / 2) - (0.066 * overlayWidth)}px;float:right;right: 0px;display: inline-block;position: fixed;`;
				Array.from(toolbarDiv.querySelectorAll('div')).map(x => {
					x.style.height = `${0.02 * overlayWidth}px`;
					x.style.width = `${0.02 * overlayWidth}px`;
					x.style.borderRadius = `${0.02 * overlayWidth}px`;
					x.style.marginTop = `${0.002 * overlayWidth}px`;
					x.style.fontSize = `${0.016 * overlayWidth}`;
				});

			}


		}
	}

	/*
	*Destroy overlay viewer
	* 
	*Static no parameter
	*
	*/

	closeOverlay() {
		document.body.removeChild(document.querySelector('#gallery-overlay'));
		document.body.style.overflow = '';
		document.body.style.margin = ''
		document.querySelector('head').removeChild(document.querySelector('#ctc-scroll-css'));
	}

	/*
	*Optimize image dimension for viewing 
	* 
	*@param screenWidth Window's inner width
	*@param screenHeight Window's inner height
	*@param imageActualWidth Original width of image
	*@param imageActualHeight Original height of image
	*@param imgCount Toal count of images in gallery
	*
	*/

	getOptimizedImageSize(screenWidth, screenHeight, imageActualWidth, imageActualHeight, imgCount) {

		var imageScreenHeightRatio = 0,
			imageScreenWidthRatio = 0,
			optimizedImageHeight = 0,
			optimizedImageWidth = 0;
		let imgPercent = undefined != imgCount && 1 < imgCount ? 0.93 : 0.955;
		let marginPercent = 1 - imgPercent;
		if ((imageActualWidth >= screenWidth) && (imageActualHeight >= screenHeight)) {
			if (imageActualWidth >= imageActualHeight) {
				if (imageActualWidth > imageActualHeight) {
					imageScreenWidthRatio = imageActualWidth / screenWidth;
					optimizedImageWidth = (imageActualWidth / imageScreenWidthRatio) - (marginPercent * screenWidth);
					optimizedImageHeight = imageActualHeight * (optimizedImageWidth / imageActualWidth);
					if (optimizedImageHeight >= (imgPercent * screenHeight)) {
						imageScreenHeightRatio = screenHeight / imageActualHeight;
						optimizedImageHeight = imageActualHeight * imageScreenHeightRatio - (marginPercent * screenHeight);
						optimizedImageWidth = imageActualWidth * (optimizedImageHeight / imageActualHeight);
					}
				} else {
					if (screenWidth > screenHeight) {
						optimizedImageHeight = (imgPercent * screenHeight);
						optimizedImageWidth = optimizedImageHeight;
					} else if (screenHeight > screenWidth) {
						optimizedImageWidth = (imgPercent * screenWidth);
						optimizedImageHeight = optimizedImageWidth;
					} else {
						imageScreenHeightRatio = screenHeight / imageActualHeight;
						optimizedImageHeight = imageActualHeight * imageScreenHeightRatio - (marginPercent * screenHeight);
						optimizedImageWidth = imageActualWidth * (optimizedImageHeight / imageActualHeight);
					}
				}
			} else {
				imageScreenHeightRatio = imageActualHeight / screenHeight;
				optimizedImageHeight = (imageActualHeight / imageScreenHeightRatio) - (marginPercent * screenHeight);
				optimizedImageWidth = imageActualWidth * (optimizedImageHeight / imageActualHeight);
			}

		} else if (imageActualWidth >= screenWidth && imageActualHeight < screenHeight) {
			imageScreenWidthRatio = screenWidth / imageActualWidth;
			optimizedImageWidth = imageActualWidth * imageScreenWidthRatio - (marginPercent * screenWidth);
			optimizedImageHeight = imageActualHeight * (optimizedImageWidth / imageActualWidth);
		} else if (imageActualHeight >= screenHeight && imageActualWidth < screenWidth) {
			imageScreenHeightRatio = screenHeight / imageActualHeight;
			optimizedImageHeight = imageActualHeight * imageScreenHeightRatio - (marginPercent * screenHeight);
			optimizedImageWidth = imageActualWidth * (optimizedImageHeight / imageActualHeight);
			optimizedImageHeight = imageActualHeight * (optimizedImageWidth / imageActualWidth);
		} else {
			var avilableImageWidth = imgPercent * screenWidth;
			var avilableImageHeight = imgPercent * screenHeight;
			if (imageActualWidth >= avilableImageWidth && imageActualHeight >= avilableImageHeight) {
				var imageAvilableWidthRatio = avilableImageWidth / imageActualWidth;
				imageAvilableHeightRatio = avilableImageHeight / imageActualHeight;
				optimizedImageWidth = avilableImageWidth * imageAvilableWidthRatio;
				optimizedImageHeight = screenHeight * imageScreenHeightRatio;
			} else if (imageActualWidth >= avilableImageWidth && imageActualHeight < avilableImageHeight) {
				var imageAvilableWidthRatio = avilableImageWidth / imageActualWidth;
				optimizedImageWidth = imageActualWidth * imageAvilableWidthRatio;
				optimizedImageHeight = imageActualHeight * (optimizedImageWidth / imageActualWidth);
			} else if (imageActualHeight >= avilableImageHeight && imageActualWidth < avilableImageWidth) {
				var imageAvilableHeightRatio = avilableImageHeight / imageActualHeight;
				optimizedImageHeight = imageActualHeight * imageAvilableHeightRatio;
				optimizedImageWidth = imageActualWidth * (optimizedImageHeight / imageActualHeight);
			} else {
				optimizedImageWidth = imageActualWidth;
				optimizedImageHeight = imageActualHeight;
			}
			optimizedImageHeight = imageActualHeight * (optimizedImageWidth / imageActualWidth);
		}


		//at last check it optimized width is still large			
		if (optimizedImageWidth > (imgPercent * screenWidth)) {
			optimizedImageWidth = imgPercent * screenWidth;
			optimizedImageHeight = imageActualHeight * (optimizedImageWidth / imageActualWidth);
		}
		return {
			width: optimizedImageWidth,
			height: optimizedImageHeight
		};
	}

	/*
	*Handle keystroke event
	* 
	*@param e Key stroke event
	*
	*/

	onKeyStroke(event) {
		let overlayDiv = document.querySelector('#gallery-overlay');
		if (undefined != overlayDiv) {
			switch (event.code) {

				case 'ArrowUp':
					document.querySelector('#img-zoom-in').click();
					break;
				case 'ArrowDown':
					document.querySelector('#img-zoom-out').click();
					break;
				case 'ArrowLeft':
					document.querySelector('#gal-prev-img').click();
					break;
				case 'ArrowRight':
					document.querySelector('#gal-next-img').click()
					break;
				case 'Escape':
					overlayDiv.querySelector('#overlay-close-btn').click();
					break;
			}
		}
	}


}