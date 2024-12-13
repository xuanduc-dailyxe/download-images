//const proxyUrl = 'https://api.allorigins.win/raw?url='; 
const proxyUrl = '';
var finalBlobs = [];
var dataConfig = {
    tabActiveDefault: "#tab-content-1",
    urlPage: "",
    html: "",
    regex: "",
    domain: "",
    filename: "",
    filenameZip: "",
    extention: "",
    folder: "",
    name: "",
    start: 1,
    count: 70,
};

var arrImages = [];

function checkImageHTML() {
    finalBlobs = [];
    var urlHtml = ace.edit("input-html").getValue();
    var inputRegex = $("#input-regex").val();
    var removeParams = $("#check-remove-params");
    var urlPage = $("#input-domain").val();
    var checkFindPicture = $("#check-find-picture");
    var tag = checkFindPicture.is(":checked") ? "source" : "img"

    var imgTags = $(urlHtml).find(tag);
    var imgTagsTemp = [];
    var imgArr = [];
    var datasrc, src, srcset, url, filename;
    var arrayFlash;
    var regex = inputRegex && inputRegex.length > 0 ? new RegExp(inputRegex, 'g') : null;

    var repalceParamsFrom = dataConfig["input-replace-params-from"];
    var repalceParamsTo = dataConfig["input-replace-params-to"];

    imgTags.each(function (index, item) {
        datasrc = $(this).attr("data-src");
        src = $(this).attr("src");
        srcset = $(this).attr("srcset");
        if (srcset != undefined || datasrc != undefined || src != undefined) {
            if (removeParams.is(":checked")) {
                url = datasrc ? datasrc.split('?')[0] : srcset ? srcset.split('?')[0] : src.split('?')[0];
            } else {
                url = datasrc ? datasrc : (srcset ? srcset : src);
            }
            url = url.split(' ')[0];
            url = url.split(',')[0];
            if (repalceParamsFrom && repalceParamsTo && repalceParamsTo.length > 0 && repalceParamsTo.length > 0) {
                url = url.replaceAll(repalceParamsFrom, repalceParamsTo);
            }

            arrayFlash = url.split('/');
            filename = arrayFlash[arrayFlash.length - 1];

            if (url && !url.startsWith('data:image') && isValidUrl(url)) {
                if (regex !== null) {
                    while ((m = regex.exec(filename)) !== null) {
                        try {
                            imgTagsTemp.push({ "id": parseInt(m[1]) < 10 ? '0' + m[1] : m[1], "url": url })
                        } catch (error) {
                            imgTagsTemp.push({ "id": m[1], "url": url })
                        }
                    }
                } else {
                    imgTagsTemp.push({ "id": index, "url": url })
                }

            } else {
                if (urlPage && urlPage.length > 0) {
                    let domain = (new URL(urlPage));
                    const protocol = domain.protocol;
                    domain = protocol + "//" + domain.hostname;
                    url = domain + url;
                    if (regex !== null) {
                        while ((m = regex.exec(filename)) !== null) {
                            try {
                                imgTagsTemp.push({ "id": parseInt(m[1]) < 10 ? '0' + m[1] : m[1], "url": url })
                            } catch (error) {
                                imgTagsTemp.push({ "id": m[1], "url": url })
                            }
                        }
                    } else {
                        imgTagsTemp.push({ "id": index, "url": url })
                    }
                }
            }
        }
    });
    if (imgTagsTemp) {
        imgTagsTemp.sort((a, b) => (a.id > b.id) ? 1 : -1);
    }
    $.each(imgTagsTemp, function (index, item) {
        imgArr.push(item.url);
    })
    var uniqueImgArr = [...new Set(imgArr)];
    if (uniqueImgArr && uniqueImgArr.length > 0) {
        buildHtmlImages(uniqueImgArr);
    } else {
        alert("Không tìm thấy hình ảnh!");
        $(".btn-download").addClass("disabled");
    }
}

function checkImageOption() {
    finalBlobs = [];
    $("#input-list-img,#url-list,#image-list").html("");
    var urlFolder = $("#url-folder").val();
    var urlCount = parseInt($("#url-count").val());
    var urlName = $("#url-name").val();
    var urlStart = parseInt($("#url-start").val());
    var imgArr = [];
    var fileName;
    if (urlFolder && urlCount > 0 && urlName) {
        for (var i = urlStart; i < urlCount + urlStart; i++) {
            fileName = urlName.replaceAll("{index}", i);
            imgArr.push(urlFolder + fileName);
        }
    }
    if (imgArr) {
        buildHtmlImages(imgArr);
    } else {
        $(".btn-download").addClass("disabled");
    }
}

function checkImage(id) {
    finalBlobs = [];
    $(id).find("#url-list,#image-list").html("");

    var str = $(id).find("#input-list-img").val();
    if (!str || str.trim().length == 0) {
        alert("Bạn chưa nhập dữ liệu!.")
        return;
    }
    var imgArr = [];
    if (!str.includes(",") && str.includes("\n")) {
        str = str.replaceAll("\n", ",");
    }
    str = str.replaceAll("\&quot;", "\"");
    try {
        imgArr = JSON.parse(str);
    }
    catch {
        str = str.replaceAll("\"", "");
        str = str.replaceAll("\"|[|]", "");
        imgArr = str.split(",");
    }
    arrImages = $.grep(imgArr, function (value) {
        return value.trim().length > 0;
    });
    var uniqueImgArr = [...new Set(arrImages)];
    if (uniqueImgArr) {
        buildHtmlImages(uniqueImgArr);
    } else {
        $(".btn-download").addClass("disabled");
    }
}

function checkImagePage() {
    finalBlobs = [];
    var urlPage = $("#input-urlpage").val();
    var tagParent = $("#input-class-parent").val();
    var removeParams = $("#check-remove-params");
    $.ajax({
        url: proxyUrl + urlPage, success: function (data) {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = data;
            var imgTags;
            if (tagParent && tagParent.length > 0) {
                imgTags = $(wrapper).find(tagParent).find("img");
            } else {
                imgTags = $(wrapper).find("img");
            }

            var imgArr = [];
            var datasrc, src, url;
            imgTags.each(function () {
                datasrc = $(this).attr("data-src");
                src = $(this).attr("src");
                srcset = $(this).attr("srcset");
                if (srcset != undefined || datasrc != undefined || src != undefined) {
                    if (removeParams.is(":checked")) {
                        url = datasrc ? datasrc.split('?')[0] : srcset ? srcset.split('?')[0] : src.split('?')[0];
                    } else {
                        url = datasrc ? datasrc : (srcset ? srcset : src);
                    }
                    url = url.split(' ')[0];
                    url = url.split(',')[0];
                    if (url && !url.startsWith('data:image') && isValidUrl(url)) {
                        imgArr.push(url);
                    } else {
                        let domain = (new URL(urlPage));
                        const protocol = domain.protocol;
                        domain = protocol + "//" + domain.hostname;
                        url = domain + url;
                        if (url && isValidUrl(url)) {
                            imgArr.push(url);
                        }
                    }
                }
            });
            var uniqueImgArr = [...new Set(imgArr)];
            if (uniqueImgArr && uniqueImgArr.length > 0) {
                buildHtmlImages(uniqueImgArr);
            } else {
                alert("Không tìm thấy hình ảnh!");
                $(".btn-download").addClass("disabled");
            }
        }
    });
}

function formatNumberToString(number) {
    if (+number < 10) {
        return "0" + number;
    }
    return number;
}

async function buildHtmlImages(imgArr) {
    $("#image-list .img-item .btn-delete").off("click");
    $("#image-list .img-item .btn-download").off("click");

    if (imgArr && imgArr.length > 0) {
        $("#image-list").removeClass("loaded");
        $("#input-list-img,#url-list,#image-list").html("");
        if (!isValidUrl(imgArr[0])) {
            alert("Có lỗi ở dữ liệu đầu vào. Vui lòng kiểm tra lại!");
            $(".btn-download").addClass("disabled");
            return;
        }
        var fileNameImage = $("#input-filename").val();
        var fileExtention = $('#input-extention').val();
        var checkReverse = $('#check-reverse');
        var fileName = extent = strExtent = "";
        var arrStr = [];
        var w = parseInt($("#input-width").val());
        var h = parseInt($("#input-height").val());
        var sizeConfig = undefined;
        if (w > 0 && h > 0) {
            sizeConfig = {
                width: w,
                height: h
            };
        }

        if (checkReverse.is(":checked")) {
            arrImages = imgArr.reverse();
        } else {
            arrImages = imgArr;
        }
        var sizeInfo, response, blob, finalBlob, image, width, height, imageUrl, sizeInKB;
        for (let i = 0; i < arrImages.length; i++) {
            fileName = "";
            arrStr = arrImages[i].trim().split("/");
            fileName = arrStr[arrStr.length - 1];
            fileName = fileName.split('?')[0];
            if (fileNameImage && fileNameImage.length > 0) {
                try {
                    response = await fetch(proxyUrl + arrImages[i].trim());
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    blob = await response.blob();
                    if (sizeConfig) {
                        finalBlob = await resizeByBlob(blob, sizeConfig);
                    } else {
                        finalBlob = await fetch(arrImages[i].trim()).then((r) => {
                            if (r.status === 200) return r.blob();
                            return Promise.reject(new Error(r.statusText));
                        });
                    }
                    finalBlobs.push(finalBlob);
                    imageUrl = URL.createObjectURL(finalBlob);
                    image = await createImageBitmap(finalBlob);
                    width = image.width;
                    height = image.height;
                    sizeInKB = finalBlob.size / 1024;
                    sizeInfo = width + "x" + height + "<br>" + sizeInKB.toFixed(2) + "Kb";

                    if (fileExtention && fileExtention.length > 0) {
                        $("#image-list").append(`<div class="img-item"><span class="btn btn-delete" data-id="${i}">X</span><span class="size-info">${sizeInfo}</span><span class="btn btn-download" data-id="${i}"><span class="material-symbols-rounded">download</span></span><img src="${imageUrl}" /><span>${fileNameImage}-${formatNumberToString(i + 1)}.${fileExtention}</span></div>`);
                    } else {
                        extent = fileName.split(".");
                        strExtent = extent && extent.length > 1 ? extent[extent.length - 1] : "jpg";
                        strExtent = strExtent.split('?')[0];
                        $("#image-list").append(`<div class="img-item"><span class="btn btn-delete" data-id="${i}">X</span><span class="size-info">${sizeInfo}</span><span class="btn btn-download" data-id="${i}"><span class="material-symbols-rounded">download</span></span><img src="${imageUrl}" /><span>${fileNameImage}-${formatNumberToString(i + 1)}.${strExtent}</span></div>`);
                        $("#label-extention").text(strExtent);
                    }

                } catch (error) {
                    showMessage(`Không thể tải hình ảnh. <br> ${arrImages[i]}  <br> Có thể do lỗi CORS hoặc URL không hợp lệ.`);
                    continue;
                }
            } else {
                $("#image-list").append(`<div class="img-item"><span class="btn btn-delete" data-id="${i}">X</span><span class="size-info">${sizeInfo}</span><span class="btn btn-download" data-id="${i}"><span class="material-symbols-rounded">download</span></span><img src="${imageUrl}" /><span>${fileName}</span></div>`);
            }
        }
        $("#image-list").addClass("loaded");

        $("#image-list .img-item .btn-delete").on("click", function () {
            var index = $(this).closest(".img-item").index();
            arrImages.splice(index, 1);
            finalBlobs.splice(index, 1);
            $(".img-item").eq(index).remove();
        })

        $("#image-list .img-item .btn-download").on("click", function () {
            $("#spinner").removeClass("none");
            var index = $(this).closest(".img-item").index();
            var fileNameImage = $("#input-filename").val();
            var extent = arrImages[index].split(".");
            var strExtent = extent && extent.length > 1 ? extent[extent.length - 1] : "jpg";
            strExtent = strExtent.split('?')[0];
            downloadImage(arrImages[index], `${fileNameImage}-${formatNumberToString(index + 1)}.${fileExtention ? fileExtention : strExtent}`);
            $("#spinner").addClass("none");
        })

        $("#number-img").html("(" + arrImages.length + " hình)");
        $("#url-list").html(arrImages.toString().replaceAll(",", ",&#13;&#10;"));

        $(".image-list-container").css("opacity", "1");
        $(".btn-download").removeClass("disabled");
    }
}

function showMessage(str) {
    if (str) {
        $(".message .close").off();
        if ($(".message").length > 0) {
            $(".message .content").html(`${str}`);
        } else {
            $("body").append(`<div class="message"> 
                <div class="message-content">
                <button class="close"><span class="material-symbols-rounded">close</span></button>
                    <span class="material-symbols-rounded">info</span>
                    <p class="content">${str}</p>
                </div>
            </div>`);
        }
        $(".message .close").on("click", function () {
            $("body>.message").remove();
        })
    }

}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (err) {
        return false;
    }
}

function saveLocalConfig() {
    var dataStr = JSON.stringify(dataConfig);
    localStorage.setItem("data-config", dataStr);
}

function getLocalConfig() {
    var dataConfigRaw = localStorage.getItem("data-config");

    if (dataConfigRaw) {
        return JSON.parse(dataConfigRaw);
    }
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const downloadAll = async () => {
    let link = document.createElement("a");
    document.documentElement.append(link);
    var fileNameImage = $("#input-filename").val();
    var fileExtention = $('#input-extention').val();
    fileNameImage = fileNameImage && fileNameImage.length > 0 ? fileNameImage : "image_";
    var imgArr = arrImages;
    var extent = strExtent = "";

    if (imgArr) {
        for (let i = 0; i < imgArr.length; i++) {
            extent = imgArr[i].split(".");
            strExtent = extent && extent.length > 1 ? extent[extent.length - 1] : "jpg";
            strExtent = strExtent.split('?')[0];
            downloadImage(imgArr[i], `${fileNameImage}-${formatNumberToString(i + 1)}.${fileExtention ? fileExtention : strExtent}`);
            await delay(500);
        }
    } else {
        alert("Không có dữ liệu");
        $("#input-list-img").focus();
    }
};

const downloadZip = function () {
    $("#spinner").removeClass("none");
    var imgArr = arrImages;
    var filename = $("#input-filename-zip").val();
    var nombre = filename ? filename.trim() : "img_zip";
    var name = nombre + ".zip";
    saveZip(name, imgArr);
}

const saveZip = async (filename, urls) => {
    if (!urls) return;
    var filename = $("#input-filename-zip").val();
    var nombre = filename ? filename.trim() : "img_zip";
    const zip = new JSZip();
    const folder = zip.folder(nombre);
    var fileNameImage = $("#input-filename").val();
    var fileExtention = $('#input-extention').val();
    var extent = strExtent = "";
    var name = "";
    $.each(finalBlobs, function (index, finalBlob) {
        $(".spinner-text").text("Đang chuẩn bị dữ liệu..." + "(" + (index + 1) + "/" + finalBlobs.length + ")");
        if (arrImages && arrImages[index] && arrImages[index].split(".")) {
            name = arrImages[index].split(".")[0];
        }
        if (fileNameImage && fileNameImage.length > 0) {
            strExtent = extent && extent.length > 1 ? extent[extent.length - 1] : "jpg";
            strExtent = strExtent.split('?')[0];
            folder.file(`${fileNameImage}-${formatNumberToString(index + 1)}.${fileExtention ? fileExtention : strExtent}`, finalBlob);
        } else {
            folder.file(`${name}`, finalBlob);
        }
    })

    zip.generateAsync({ type: "blob" }, function updateCallback(metadata) {
        $(".spinner .value").text(Math.round(metadata.percent, 0) + "%");
        $(".spinner-text").text("Đang nén dữ liệu...");
    }).then((blob) => {
        saveAs(blob, filename);
        $(".spinner-text").text("Đang chuẩn bị dữ liệu...");
        $("#spinner").addClass("none");
    });
};

async function resizeByBlob(blob, sizeConfig) {
    let finalBlob;
    // Nếu có sizeConfig, thực hiện crop và resize
    if (sizeConfig && sizeConfig.width && sizeConfig.height) {
        const inputExtention = $("#input-extention").val();
        const image = await createImageBitmap(blob);
        const width = image.width;
        const height = image.height;

        console.log(`Ảnh gốc: Width=${width}, Height=${height}`);

        // Tính toán tỷ lệ crop
        const targetAspectRatio = sizeConfig.width / sizeConfig.height;
        const sourceAspectRatio = width / height;

        let cropWidth, cropHeight;

        if (sourceAspectRatio > targetAspectRatio) {
            // Ảnh gốc rộng hơn so với tỷ lệ mục tiêu
            cropHeight = height;
            cropWidth = cropHeight * targetAspectRatio;
        } else {
            // Ảnh gốc cao hơn hoặc bằng so với tỷ lệ mục tiêu
            cropWidth = width;
            cropHeight = cropWidth / targetAspectRatio;
        }

        // Đảm bảo crop không vượt quá kích thước gốc
        cropWidth = Math.min(cropWidth, width);
        cropHeight = Math.min(cropHeight, height);

        // Tính toán offset để crop ở giữa
        const offsetX = (width - cropWidth) / 2;
        const offsetY = (height - cropHeight) / 2;

        console.log(`Tính toán crop: OffsetX=${offsetX}, OffsetY=${offsetY}, Width=${cropWidth}, Height=${cropHeight}`);

        // Tạo canvas để crop ảnh
        const cropCanvas = document.createElement('canvas');
        const cropCtx = cropCanvas.getContext('2d');
        cropCanvas.width = cropWidth;
        cropCanvas.height = cropHeight;

        cropCtx.drawImage(image, offsetX, offsetY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        // Tạo canvas để resize ảnh
        const resizeCanvas = document.createElement('canvas');
        const resizeCtx = resizeCanvas.getContext('2d');
        resizeCanvas.width = sizeConfig.width;
        resizeCanvas.height = sizeConfig.height;

        resizeCtx.drawImage(cropCanvas, 0, 0, cropWidth, cropHeight, 0, 0, sizeConfig.width, sizeConfig.height);

        const topWatermark = parseInt(dataConfig["input-top-watermark"]);
        const rightWatermark = parseInt(dataConfig["input-right-watermark"]);
        const bottomWatermark = parseInt(dataConfig["input-bottom-watermark"]);
        const leftWatermark = parseInt(dataConfig["input-left-watermark"]);
        const watermarkConfig = {
            base64: dataConfig["input-file-watermark"],
            width: parseInt(dataConfig["input-width-watermark"]), // Chiều rộng watermark
            position: {
                top: topWatermark,
                right: rightWatermark,
                bottom: bottomWatermark,
                left: leftWatermark
            } // Vị trí watermark
        };

        if (dataConfig["check-watermark"] && watermarkConfig && watermarkConfig.base64) {
            const watermarkBase64 = watermarkConfig.base64;
            const watermarkBlob = await fetch(watermarkBase64).then(res => res.blob());
            const watermarkImage = await createImageBitmap(watermarkBlob);

            // Tính toán kích thước watermark
            const watermarkWidth = watermarkConfig.width || 150; // Chiều rộng mặc định
            const aspectRatio = watermarkImage.width / watermarkImage.height;
            const watermarkHeight = watermarkWidth / aspectRatio;

            // Tính toán vị trí watermark
            const position = watermarkConfig.position || {};
            const top = position.top > 0 ? position.top : (position.bottom > 0 ? resizeCtx.canvas.height - watermarkHeight - position.bottom : 20);
            const left = position.left > 0 ? position.left : (position.right > 0 ? resizeCtx.canvas.width - watermarkWidth - position.right : 20);

            console.log(`Chèn watermark tại vị trí: Top=${top}, Left=${left}, Width=${watermarkWidth}, Height=${watermarkHeight}`);

            // Chèn watermark vào ảnh
            resizeCtx.drawImage(
                watermarkImage,
                left,
                top,
                watermarkWidth,
                watermarkHeight
            );
        }

        // Chuyển canvas thành blob với định dạng và chất lượng tùy chọn
        const mimeType = inputExtention  && inputExtention == "jpg" ? "image/jpeg" : inputExtention == "png" ? "image/png" :  "image/" + inputExtention;  
        const quality = 1; // Chất lượng nén (từ 0.0 đến 1.0)

        finalBlob = await new Promise(resolve =>
            resizeCanvas.toBlob(resolve, mimeType, quality)
        );

        console.log(`Ảnh đã được crop và resize: Width=${sizeConfig.width}, Height=${sizeConfig.height}`);
        console.log(`Kích thước Blob mới: ${finalBlob.size} bytes`);

        return finalBlob;
    }

    return finalBlob;
}

async function downloadImage(url, fileName) {
    try {
        // Tải ảnh qua proxy
        const response = await fetch(proxyUrl + url);
        if (!response.ok) {
            return;
        }
        const blob = await response.blob();
        var w = parseInt($("#input-width").val());
        var h = parseInt($("#input-height").val());
        var sizeConfig = undefined;

        if (w > 0 && h > 0) {
            sizeConfig = {
                width: w,
                height: h
            };
        }

        let finalBlob;
        if (sizeConfig) {
            finalBlob = await resizeByBlob(blob, sizeConfig);
        } else {
            finalBlob = await fetch(url).then((r) => {
                if (r.status === 200) return r.blob();
                return Promise.reject(new Error(r.statusText));
            });
        }

        // Lưu ảnh đã xử lý
        saveAs(finalBlob, fileName);
    } catch (error) {
        console.error('Error downloading image:', error);
    }
}

function toogleClassActive(e) {
    if (e.target.classList.contains('active')) {
        e.target.classList.remove("active")
    } else {
        e.target.classList.add("active")
    }
}

function formatHtml(code) {
    return html_beautify(code, { indent_size: 2, wrap_line_length: 80 })
}

$(document).ready(function () {
    $("#check-reverse").on("change", function () {
        buildHtmlImages(arrImages);
    });

    $(".nav-link").on("click", function () {
        $(".nav-link").removeClass("active");
        $(this).addClass("active");
        var target = $(this).attr("data-target");
        $(".tab-pane").removeClass("active");
        $(target).addClass("active");
        dataConfig["tabActiveDefault"] = target;
        saveLocalConfig();
    })

    var dataConfigRaw = getLocalConfig();
    if (dataConfigRaw) {
        dataConfig = dataConfigRaw;
        for (const prop in dataConfig) {
            switch (prop) {
                case "tabActiveDefault":
                    $('.nav-link[data-target="' + dataConfig[prop] + '"]').click();
                    break;
                case "check-watermark":
                case "check-reverse":
                case "check-find-picture":
                    $('[data-field="' + prop + '"]').prop("checked", dataConfig[prop])
                    break;
                case "input-html":
                    ace.edit("input-html").setValue(formatHtml(dataConfig[prop]), -1);
                    break;
                case "input-file-watermark":
                    $('#preview-watermark').attr("src", dataConfig[prop]);
                    break;
                default:
                    $('[data-field="' + prop + '"]').val(dataConfig[prop]);
                    break;
            }
        }
    }

    $("[data-field]").each(function () {
        var instand = this;
        $(instand).on("change", function () {
            var field = $(this).attr("data-field");
            var type = $(this).attr("type");
            switch (type) {
                case "checkbox":
                    dataConfig[field] = $(this).prop("checked");
                    break;
                case "input-file-watermark":
                    break;
                case "input-html":
                    dataConfig[field] = $(this).getValue();
                    break;
                default:
                    dataConfig[field] = $(this).val();
                    break;
            }
            saveLocalConfig();
        });
    })


    const editor = ace.edit("input-html");
    editor.resize();
    editor.session.setMode("ace/mode/html"); // Thiết lập chế độ ngôn ngữ

    editor.session.on('change', function () {
        dataConfig["input-html"] = editor.getValue();
        saveLocalConfig();
    });

    // Setting
    const imageInput = document.getElementById('input-file-watermark');
    const previewImage = document.getElementById('preview-watermark');

    // Lắng nghe sự kiện thay đổi của input file
    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0]; // Lấy file đầu tiên từ input
        if (file) {
            const reader = new FileReader(); // Tạo FileReader để đọc file

            // Khi FileReader load xong
            reader.onload = (e) => {
                const base64Image = e.target.result;
                previewImage.src = base64Image; // Gán src của thẻ img bằng kết quả đọc file
                previewImage.style.display = 'block'; // Hiển thị thẻ img
                dataConfig["input-file-watermark"] = base64Image;
                saveLocalConfig();
            };

            reader.readAsDataURL(file); // Đọc file dưới dạng Data URL
        }
    });
})
