const ENDPOINTS = {
  UPLOAD: 'http://localhost:1234/upload',
  UPLOAD_STATUS: 'http://localhost:1234/upload-status',
  UPLOAD_REQUEST: 'http://localhost:1234/upload-request',
  UPLOAD_READ_FILE: 'http://localhost:1234/upload-read',
}

const uploadFiles = (() => {


	const fileRequests = new WeakMap();


	const defaultOptions = {
		url: ENDPOINTS.UPLOAD,
		startingByte: 0,
		fileId: '',
		onAbort() {},
		onProgress() {},
		onError() {},
		onComplete() {}
	};


	const uploadFileChunks = (file, options) => {
		const formData = new FormData();
		const req = new XMLHttpRequest();
		const chunk = file.slice(options.startingByte);

		formData.append('chunk', chunk, file.name);
		formData.append('fileId', options.fileId);

		req.open('POST', options.url, true);
		req.setRequestHeader('Content-Range', `bytes=${options.startingByte}-${options.startingByte+chunk.size}/${file.size}`);
		req.setRequestHeader('X-File-Id', options.fileId);

		req.onload = (e) => {
			// it is possible for load to be called when the request status is not 200
			// this will treat 200 only as success and everything else as failure
			if (req.status === 200) {
				options.onComplete(e, file);
			} else {
				options.onError(e, file);
			}
		}

		req.upload.onprogress = (e) => {
			const loaded = options.startingByte + e.loaded;
			options.onProgress({...e,
				loaded,
				total: file.size,
				percentage: loaded * 100 / file.size
			}, file);
		}

		req.ontimeout = (e) => options.onError(e, file);

		req.onabort = (e) => options.onAbort(e, file);

		req.onerror = (e) => options.onError(e, file);

		fileRequests.get(file).request = req;

		req.send(formData);
	};

	const uploadFile = (file, options) => {
		return fetch(ENDPOINTS.UPLOAD_REQUEST, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				fileName: file.name,
				fileId: file.fileId,
			})
		})
			.then(res => res.json())
			.then(res => {
				options = {...options, ...res};
				fileRequests.set(file, {request: null, options});

				uploadFileChunks(file, options);
			})
			.catch(e => {
				options.onError({...e, file})
			})
	}

	const abortFileUpload = async file => {
		const fileReq = fileRequests.get(file);

		if (fileReq && fileReq.request) {
			fileReq.request.abort();
			return true;
		}

		return false;
	};

	const retryFileUpload = file => {
		const fileReq = fileRequests.get(file);

		if (fileReq) {
			// try to get the status just in case it failed mid upload
			return fetch(`${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}&fileId=${fileReq.options.fileId}`)
				.then(res => res.json())
				.then(res => { // if uploaded we continue
					uploadFileChunks(file, {...fileReq.options, startingByte: Number(res.totalChunkUploaded)});
				})
				.catch(() => { // if never uploaded we start
					uploadFileChunks(file, fileReq.options)
				})
		}
	};

	const clearFileUpload = async file => {
		const fileReq = fileRequests.get(file);

		if (fileReq) {
			await abortFileUpload(file);
			fileRequests.delete(file);

			return true;
		}

		return false;
	};

	const resumeFileUpload = file => {
		const fileReq = fileRequests.get(file);

		if (fileReq) {
			return fetch(`${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}&fileId=${fileReq.options.fileId}`)
				.then(res => res.json())
				.then(res => {
					uploadFileChunks(file, {...fileReq.options, startingByte: Number(res.totalChunkUploaded)});
				})
				.catch(e => {
					fileReq.options.onError({...e, file})
				})
		}
	}

	return (files, options = defaultOptions) => {
		[...files].forEach(file => uploadFile(file, {...defaultOptions, ...options}));

		return {
			abortFileUpload,
			retryFileUpload,
			clearFileUpload,
			resumeFileUpload
		}
	}
})();

const uploadAndTrackFiles = (( ) => {

  //const progressBox = document.createElement('div');
  //document.getElementById('file-progress-tracker').appendChild(progressBox);

  const files = new Map();
	//const progressBox = document.createElement('div');
	const FILE_STATUS = {
		PENDING: 'pending',
		UPLOADING: 'uploading',
		PAUSED: 'paused',
		COMPLETED: 'completed',
		FAILED: 'failed'
	}
	let uploader = null;
  const progressBox = document.getElementById('progressbox-tracker');

	progressBox.className = 'upload-progress-tracker';
	// progressBox.innerHTML = `
	// 			<h3>Uploading 0 Files</h3>
	// 			<p class="upload-progress">
	// 				<span class="uploads-percentage">0%</span>
	// 				<span class="success-count">0</span>
	// 				<span class="failed-count">0</span>
	// 				<span class="paused-count">0</span>
	// 			</p>
	// 			<button type="button" class="maximize-btn">Maximize</button>
	// 			<div class="uploads-progress-bar" style="width: 0;"></div>
	// 			<div class="file-progress-wrapper"></div>
	// 		`;

	progressBox
		.querySelector('.maximize-btn')
		.addEventListener('click', (e) => {
			e.currentTarget.classList.toggle('expanded');
			progressBox.classList.toggle('expanded');
		})

	document.getElementById('progressbox-tracker').style.display="block";


  //document.getElementById('file-progress-tracker').appendChild(progressBox);
    //progressBox.querySelector('.file-progress-wrapper').appendChild(fileElement);

//se grega al body

	const updateProgressBox = () => {

    //const [title, uploadProgress, expandBtn, progressBar] = document.getElementById('file-progress-tracker').appendChild(progressBox).children;
		// document.getElementById('file-progress-tracker').appendChild(progressBox);


    const [title, uploadProgress, expandBtn, progressBar] = document.getElementById('progressbox-tracker').children;
		// const [title, uploadProgress, expandBtn, progressBar] = progressBox.children;

		if (files.size > 0) {
			let totalUploadedFiles = 0;
			let totalUploadingFiles = 0;
			let totalFailedFiles = 0;
			let totalPausedFiles = 0;
			let totalChunkSize = 0;
			let totalUploadedChunkSize = 0;
			//document.getElementById('file-progress-tracker').appendChild(uploadProgress);

			const [uploadedPerc, successCount, failedCount, pausedCount] = uploadProgress.children;
      //const [uploadedPerc, successCount, failedCount, pausedCount] = document.getElementById('file-progress-wrapper').appendChild(uploadProgress).children;

			files.forEach(fileObj => {
				if(fileObj.status === FILE_STATUS.FAILED) {
					totalFailedFiles += 1;
				} else {
					if (fileObj.status === FILE_STATUS.COMPLETED) {
						totalUploadedFiles += 1;
					} else if(fileObj.status === FILE_STATUS.PAUSED) {
						totalPausedFiles += 1;
					} else {
						totalUploadingFiles += 1;
					}

					totalChunkSize += fileObj.size;
					totalUploadedChunkSize += fileObj.uploadedChunkSize;
				}
			});

			const percentage = totalChunkSize > 0 ? Math.min(100, Math.round((totalUploadedChunkSize * 100) / totalChunkSize)) : 0;

			title.textContent = percentage === 100
				? `Uploaded ${totalUploadedFiles} File${totalUploadedFiles !== 1 ? 's' : ''}`
				: `Uploading ${totalUploadingFiles}/${files.size} File${files.size !== 1 ? 's' : ''}`;
			uploadedPerc.textContent = `${percentage}%`;
			successCount.textContent = totalUploadedFiles;
			failedCount.textContent = totalFailedFiles;
			pausedCount.textContent = totalPausedFiles;
			progressBar.style.width = `${percentage}%`;
			progressBox.style.backgroundSize = `${percentage}%`;
			expandBtn.style.display = 'inline-block';
			uploadProgress.style.display = 'block';
			progressBar.style.display = 'block';

		} else {
			title.textContent = 'No Upload in Progress'
			expandBtn.style.display = 'none';
			uploadProgress.style.display = 'none';
			progressBar.style.display = 'none';
		}

		document.getElementsByClassName('file-progress-wrapper').append=document.getElementById('file-progress').style.display="block"
		console.log("------------------------------------------------");

	}

	const updateFileElement = fileObject => {
		const [
			{children: [{children: [status]}, progressBar]}, // .file-details
			{children: [retryBtn, pauseBtn, resumeBtn, clearBtn,callBtn]} // .file-actions
		] = fileObject.element.children;

		requestAnimationFrame(() => {
			status.textContent = fileObject.status === FILE_STATUS.COMPLETED ? fileObject.status : `${Math.round(fileObject.percentage)}%`;
			status.className = `status ${fileObject.status}`;
			progressBar.style.width = fileObject.percentage + '%';
			progressBar.style.background = fileObject.status === FILE_STATUS.COMPLETED
				? 'green' : fileObject.status === FILE_STATUS.FAILED
					? 'red' : '#222';
			pauseBtn.style.display = fileObject.status === FILE_STATUS.UPLOADING ? 'inline-block' : 'none';
			retryBtn.style.display = fileObject.status === FILE_STATUS.FAILED ? 'inline-block' : 'none';
			resumeBtn.style.display = fileObject.status === FILE_STATUS.PAUSED ? 'inline-block' : 'none';
			clearBtn.style.display = fileObject.status === FILE_STATUS.COMPLETED || fileObject.status === FILE_STATUS.PAUSED
				? 'inline-block' : 'none';
			callBtn.style.display =	 fileObject.status === FILE_STATUS.COMPLETED ? 'inline-block' : 'none';
			updateProgressBox();
		});
	}


	const uniqueAlphaNumericId = (() => {
		const heyStack = '0123456789abcdefghijklmnopqrstuvwxyz';
		const randomInt = () => Math.floor(Math.random() * Math.floor(heyStack.length));

		return (length = 24) => Array.from({length}, () => heyStack[randomInt()]).join('');
	})();

	const setFileElement = (file) => {
		const extIndex = file.name.lastIndexOf('.');
		const fileElement = document.createElement('div');

    //const fileElement = document.getElementById('file-progress');
		file.fileId = uniqueAlphaNumericId();
		fileElement.className = 'file-progress';

		fileElement.innerHTML = `
			<div class="file-details" style="position: relative">
				<p>
					<span class="status">pending</span>
					<span class="file-name">${file.name.substring(0, extIndex)}</span>
					<span class="file-ext">${file.name.substring(extIndex)}</span>
				</p>
				<div class="progress-bar" style="width: 0;"></div>
			</div>
			<div class="file-actions">
				<button type="button" class="retry-btn" style="display: none">Retry</button>
				<button type="button" class="cancel-btn" style="display: none">Pause</button>
				<button type="button" class="resume-btn" style="display: none">Resume</button>
				<button type="button" class="clear-btn" style="display: none">Clear</button>
				<button type="button" class="resume-btn" style="display: none" id=file-${file.fileId}-${file.name}>Call</button>
			</div>
		`;

   // progressBox.querySelector('.file-progress-wrapper').appendChild(fileElement);


		files.set(file, {
			element: fileElement,
			size: file.size,
			status: FILE_STATUS.PENDING,
			percentage: 0,
			uploadedChunkSize: 0
		});

		 const [_, {children: [retryBtn, pauseBtn, resumeBtn, clearBtn, callBtn]}] = fileElement.children;
    //const [_, {children: [retryBtn, pauseBtn, resumeBtn, clearBtn, callBtn]}] = document.getElementsByClassName('file-progress').children;



		clearBtn.addEventListener('click', () => {
			uploader.clearFileUpload(file);
			files.delete(file);
			fileElement.remove();
			updateProgressBox();
		});
		retryBtn.addEventListener('click', () => uploader.retryFileUpload(file));
		pauseBtn.addEventListener('click', () => uploader.abortFileUpload(file));
		resumeBtn.addEventListener('click', () => uploader.resumeFileUpload(file));
		callBtn.id="file-" + file.fileId + "-" + file.name;

    document.getElementById('upload-btn').append=fileElement;



    //----------------------------------------------------------------------------------------------------------------------------------


		const progressBoxCall = document.createElement('div');
		progressBoxCall.className = 'upload-progress-tracker';
		progressBoxCall.innerHTML = `
				<h3>Calling 0 Files</h3>
				<p class="upload-progress">
					<span class="uploads-percentage">0%</span>
					<span class="success-count">0</span>
					<span class="failed-count">0</span>
					<span class="paused-count">0</span>
				</p>
				<button type="button" class="maximize-btn">Maximize</button>
				<div class="uploads-progress-bar" style="width: 0;"></div>
				<div class="file-progress-wrapper"></div>

			`;

		progressBoxCall
		.querySelector('.maximize-btn')
		.addEventListener('click', (e) => {
			e.currentTarget.classList.toggle('expanded');
			progressBoxCall.classList.toggle('expanded');
		})

    //const filetracker = document.getElementById('file-progress-tracker');
    //progressBox.querySelector('.file-progress-wrapper').appendChild(progressBoxCall);


    //filetracker.appendChild(progressBoxCall);

		Rx.Observable.fromEvent(callBtn, 'click').scan((count) => count + 1, 0)
		.subscribe((count) => {
			console.log(`RX OBS Clicked ${count} times by ${callBtn.id}  $$$$$$$$$`)
			console.log(`RX OBS Clicked ${count} times $$$$$$$$$`)

			fetch(`${ENDPOINTS.UPLOAD_READ_FILE}?file=${callBtn.id}`)
			.then(async (response) => {
				let measurementsReceived = 0;
				for await (const measurement of parseJsonStream(response.body)) {
					measurementsReceived++;
					// To prevent the console from flooding we only show 1 in every 100 measurements
					if (measurementsReceived % 100 === 0) {
						console.log(`Dispositivo with id {${measurement.Descripcion}} at time ${measurement.createdAt} has MDN [${measurement.Mdn}]`);
						const rowElement = document.createElement('div');

						rowElement.className = 'file-progress';
						rowElement.innerHTML = `
							<div class="file-details" style="position: relative">
								<p>
									<span class="status">pending</span>
									<span class="file-name">${measurement.Mdn}</span>

								</p>
								<div class="progress-bar" style="width: 0;"></div>
							</div>
							<div class="file-actions">
								<button type="button" class="retry-btn" style="display:  block">Retry</button>
								<button type="button" class="clear-btn" style="display: none">Clear</button>
								<button type="button" class="resume-btn" style="display: none" id=file-${file.fileId}-${file.name}>Call</button>
							</div>
						`;
						//crear id unicos para los botones
						progressBox.querySelector('.file-progress-wrapper').appendChild(progressBoxCall);
						progressBoxCall.querySelector('.file-progress-wrapper').appendChild(rowElement);
					}
				}
			});

		});
		progressBox.querySelector('.file-progress-wrapper').appendChild(fileElement);
	}


	async function *parseJsonStream(readableStream) {
		for await (const line of readLines(readableStream.getReader())) {
			const trimmedLine = line.trim().replace(/,$/, '');

			if (trimmedLine !== '[' && trimmedLine !== ']') {
				yield JSON.parse(trimmedLine);
			}
		}
	}

	async function *readLines(reader) {
		const textDecoder = new TextDecoder();
		let partOfLine = '';
		for await (const chunk of readChunks(reader)) {
			const chunkText = textDecoder.decode(chunk);
			const chunkLines = chunkText.split('\n');
			if (chunkLines.length === 1) {
				partOfLine += chunkLines[0];
			} else if (chunkLines.length > 1) {
				yield partOfLine + chunkLines[0];
				for (let i=1; i < chunkLines.length - 1; i++) {
					yield chunkLines[i];
				}
				partOfLine = chunkLines[chunkLines.length - 1];
			}
		}
	}

	function readChunks(reader) {
		return {
			async* [Symbol.asyncIterator]() {
				let readResult = await reader.read();
				while (!readResult.done) {
					yield readResult.value;
					readResult = await reader.read();
				}
			},
		};
	}





	const onComplete = (e, file) => {
		const fileObj = files.get(file);

		fileObj.status = FILE_STATUS.COMPLETED;
		fileObj.percentage = 100;

		updateFileElement(fileObj);
	}

	const onProgress = (e, file) => {
		const fileObj = files.get(file);

		fileObj.status = FILE_STATUS.UPLOADING;
		fileObj.percentage = e.percentage;
		fileObj.uploadedChunkSize = e.loaded;

		updateFileElement(fileObj);
	}

	const onError = (e, file) => {
		const fileObj = files.get(file);

		fileObj.status = FILE_STATUS.FAILED;
		fileObj.percentage = 100;

		updateFileElement(fileObj);
	}

	const onAbort = (e, file) => {
		const fileObj = files.get(file);

		fileObj.status = FILE_STATUS.PAUSED;

		updateFileElement(fileObj);
	}

	return (uploadedFiles) => {

		[...uploadedFiles].forEach(setFileElement);
		// con esta linea se pone ebn el footer 
		//document.body.appendChild(progressBox);

		uploader = uploadFiles(uploadedFiles, {
			onProgress,
			onError,
			onAbort,
			onComplete
		});
	}
})();

const fileInput = document.getElementById('file-upload-input');
console.log("File input " + fileInput);
 if (fileInput){
  fileInput.addEventListener('change', e => {

    uploadAndTrackFiles(e.currentTarget.files)
    e.currentTarget.value = '';
  })
}

