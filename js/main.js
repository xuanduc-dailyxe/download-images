//const proxyUrl = 'https://api.allorigins.win/raw?url='; 
const proxyUrl = ''; 
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
    var urlHtml = $("#input-html").val();
    var inputRegex = $("#input-regex").val();
    var removeParams = $("#check-remove-params");
    var urlPage = $("#input-domain").val();
    var checkFindPicture = $("#check-find-picture");
    var tag = checkFindPicture.is(":checked") ? "source" : "img"

    var imgTags = $(urlHtml).find(tag); 
    var imgTagsTemp = [];
    var imgArr = [];
    var datasrc, src,srcset, url, filename;
    var arrayFlash;
    var regex = inputRegex && inputRegex .length > 0 ? new RegExp(inputRegex, 'g') : null;
 
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
    if(imgTagsTemp){
        imgTagsTemp.sort((a, b) => (a.id > b.id) ? 1 : -1);
    } 
    $.each(imgTagsTemp, function (index, item) {
        imgArr.push(item.url);
    })
    if (imgArr && imgArr.length > 0) {
        buildHtmlImages(imgArr);
    } else {
        alert("Không tìm thấy hình ảnh!");
        $(".btn-download").addClass("disabled");
    }
}

function checkImageOption() {
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
    $(id).find("#url-list,#image-list").html("");

    var str = $(id).find("#input-list-img").val(); 
    if (!str || str.trim().length == 0) {
        alert("Bạn chưa nhập dữ liệu!.")
        return;
    }
    var imgArr = [];
    if(!str.includes(",") && str.includes("\n")){
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
    arrImages = $.grep(imgArr, function(value) {
        return value.trim().length > 0;
    }); 
    if (arrImages) {
        buildHtmlImages(arrImages);
    } else {
        $(".btn-download").addClass("disabled");
    }
}

function checkImagePage() {
    var urlPage = $("#input-urlpage").val();
    var tagParent = $("#input-class-parent").val();
    var removeParams = $("#check-remove-params"); 
    $.ajax({
        url: proxyUrl+urlPage, success: function (data) {
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
            if (imgArr && imgArr.length > 0) {
                buildHtmlImages(imgArr);
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

function buildHtmlImages(imgArr) {
    if (imgArr && imgArr.length > 0) {
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
        if (checkReverse.is(":checked")) {
            arrImages = imgArr.reverse();
        } else {
            arrImages = imgArr;
        }

        for (let i = 0; i < arrImages.length; i++) {
            fileName = "";
            arrStr = arrImages[i].trim().split("/");
            fileName = arrStr[arrStr.length - 1];
            fileName = fileName.split('?')[0];
            if (fileNameImage && fileNameImage.length > 0) {

                if (fileExtention && fileExtention.length > 0) {
                    $("#image-list").append(`<div class="img-item"><span class="btn btn-delete" data-id="${i}">X</span><span class="btn btn-download" data-id="${i}"><span class="material-symbols-rounded">download</span></span><img src="${arrImages[i].trim()}" /><span>${fileNameImage}-${formatNumberToString(i + 1)}.${fileExtention}</span></div>`);
                } else {
                    extent = fileName.split(".");
                    strExtent = extent && extent.length > 1 ? extent[extent.length - 1] : "jpg";
                    strExtent = strExtent.split('?')[0];
                    $("#image-list").append(`<div class="img-item"><span class="btn btn-delete" data-id="${i}">X</span><span class="btn btn-download" data-id="${i}"><span class="material-symbols-rounded">download</span></span><img src="${arrImages[i].trim()}" /><span>${fileNameImage}-${formatNumberToString(i + 1)}.${strExtent}</span></div>`);
                    $("#label-extention").text(strExtent);
                }
            } else {
                $("#image-list").append(`<div class="img-item"><span class="btn btn-delete" data-id="${i}">X</span><span class="btn btn-download" data-id="${i}"><span class="material-symbols-rounded">download</span></span><img src="${arrImages[i].trim()}" /><span>${fileName}</span></div>`);
            }
        }
        $(".btn-delete").on("click", function(){
            var index = $(this).closest(".img-item").index();
            arrImages.splice(index, 1);
            $(".img-item").eq(index).remove(); 
        }) 

        $(".btn-download").on("click", function(){
            $("#spinner").removeClass("none"); 
            var index = $(this).closest(".img-item").index();
            var fileNameImage = $("#input-filename").val();
            var extent = arrImages[index].split(".");
            var strExtent = extent && extent.length > 1 ? extent[extent.length - 1] : "jpg";
            strExtent = strExtent.split('?')[0];
            downloadImageViaProxy(arrImages[index], `${fileNameImage}-${formatNumberToString(index + 1)}.${fileExtention ? fileExtention : strExtent}`); 
            $("#spinner").addClass("none");
        }) 

        $("#number-img").html("(" + arrImages.length + " hình)");
        $("#url-list").html(arrImages.toString().replaceAll(",", ",&#13;&#10;"));
        $("#image-list-container").css("opacity", "1");
        $(".btn-download").removeClass("disabled");
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

$("#input-filename").on("change", function () {
    dataConfig.filename = $(this).val();
    saveLocalConfig();
    buildHtmlImages(arrImages);
});
 
$("#check-reverse").on("change", function () { 
    buildHtmlImages(arrImages);
});

const timer = ms => new Promise(res => setTimeout(res, ms))
   
async function downloadImageViaProxy(url, fileName, sizeConfig) {
    try {
        // Tải ảnh qua proxy
        const response = await fetch(proxyUrl + url);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        const blob = await response.blob();

         // Lấy kích thước từ input
         var w = parseInt($("#input-width").val());
         var h = parseInt($("#input-height").val());
         var sizeConfig = undefined;
 
         if (w > 0 && h > 0) {
             sizeConfig = {
                 width: w,
                 height: h
             };
         }

        let finalBlob = blob;

        // Nếu có sizeConfig, thực hiện crop và resize
        if (sizeConfig && sizeConfig.width && sizeConfig.height) {
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

            // Chuyển canvas thành blob
            finalBlob = await new Promise(resolve => resizeCanvas.toBlob(resolve));

            console.log(`Ảnh đã được crop và resize: Width=${sizeConfig.width}, Height=${sizeConfig.height}`);
        }

        // Lưu ảnh đã xử lý
        saveAs(finalBlob, fileName);
    } catch (error) {
        console.error('Error downloading image:', error);
    }
}

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
            downloadImageViaProxy(imgArr[i], `${fileNameImage}-${formatNumberToString(i + 1)}.${fileExtention ? fileExtention : strExtent}`);
            await timer(500);
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
 
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));



const saveZip = async (filename, urls) => {
    if (!urls) return;
    var filename = $("#input-filename-zip").val();
    var nombre = filename ? filename.trim() : "img_zip";
    const zip = new JSZip();
    const folder = zip.folder(nombre);
    var fileNameImage = $("#input-filename").val();
    var fileExtention = $('#input-extention').val();
    var extent = strExtent = "";
    var w = parseInt($("#input-width").val());
    var h = parseInt($("#input-height").val());
    var sizeConfig = undefined;

    if (w > 0 && h > 0) {
        sizeConfig = {
            width: w,
            height: h
        };
    }

    for (const [index, url] of urls.entries()) {
        var proxiedUrl;
        if (proxyUrl.length > 0) {
            proxiedUrl = `${proxyUrl}${encodeURIComponent(url)}`;
        } else {
            proxiedUrl = url;
        }

        try {
            const response = await fetch(proxiedUrl);
            if (response.status === 200) {
                const blob = await response.blob();
                console.log(`Ảnh tải về thành công từ ${url}`);

                const name = url.substring(url.lastIndexOf("/") + 1);
                let finalBlob = blob;

                if (sizeConfig && sizeConfig.width && sizeConfig.height) {
                    const image = await createImageBitmap(blob);
                    const width = image.width;
                    const height = image.height;

                    console.log(`Ảnh gốc: Width=${width}, Height=${height}`);

                    // Tính toán tỷ lệ để crop kiểu contain
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

                    // Chuyển canvas thành blob
                    finalBlob = await new Promise(resolve => resizeCanvas.toBlob(resolve));

                    console.log(`Ảnh đã được crop và resize: Width=${sizeConfig.width}, Height=${sizeConfig.height}`);
                }

                if (fileNameImage && fileNameImage.length > 0) {
                    extent = name.split(".");
                    strExtent = extent && extent.length > 1 ? extent[extent.length - 1] : "jpg";
                    strExtent = strExtent.split('?')[0];
                    folder.file(`${fileNameImage}-${formatNumberToString(index + 1)}.${fileExtention ? fileExtention : strExtent}`, finalBlob);
                } else {
                    folder.file(`${name}`, finalBlob);
                }
            } else {
                console.error(`Lỗi khi tải ảnh từ ${url}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching image:', error);
        }

        $(".spinner-text").text("Đang chuẩn bị dữ liệu..." + "(" + (index + 1) + "/" + urls.length + ")");
        
        if (proxyUrl.length > 0) {
            await delay(1000); // Delay 1 giây giữa mỗi yêu cầu
        }
    }

    zip.generateAsync({ type: "blob" }, function updateCallback(metadata) {
        $(".spinner .value").text(Math.round(metadata.percent, 0) + "%");
        $(".spinner-text").text("Đang nén dữ liệu...");
    }).then((blob) => {
        saveAs(blob, filename);
        $(".spinner-text").text("Đang chuẩn bị dữ liệu...");
        $("#spinner").addClass("none");
    });
};


WebPDecodeAndDraw = function (data) {
    var decoder = new WebPDecoder();
    var bitmap = decoder.WebPDecode(data, data.length);
    var dataURL;
    if (bitmap) {
        //Draw Image
        var output = ctx.createImageData(canvas.width, canvas.height);
        var biWidth = canvas.width;
        var outputData = output.data;
        for (var h = 0; h < canvas.height; h++) {
            for (var w = 0; w < canvas.width; w++) {
                outputData[0 + w * 4 + (biWidth * 4) * h] = bitmap[0 + w * 4 + (biWidth * 4) * h];
                outputData[1 + w * 4 + (biWidth * 4) * h] = bitmap[1 + w * 4 + (biWidth * 4) * h];
                outputData[2 + w * 4 + (biWidth * 4) * h] = bitmap[2 + w * 4 + (biWidth * 4) * h];
                outputData[3 + w * 4 + (biWidth * 4) * h] = bitmap[3 + w * 4 + (biWidth * 4) * h];
            };
        }
        ctx.putImageData(output, 0, 0);
        dataURL = canvas.toDataURL("image/png");
        return dataURL;
    }
    return dataURL;
};


function getImage(img) {
    // Create an empty canvas element
    canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return WebPDecodeAndDraw(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)['data']);
}


function toogleClassActive(e) {
    if (e.target.classList.contains('active')) {
        e.target.classList.remove("active")
    } else {
        e.target.classList.add("active")
    } 
}



$(".nav-link").on("click", function () {
    $(".nav-link").removeClass("active");
    $(this).addClass("active");
    var target = $(this).attr("data-target");
    $(".tab-pane").removeClass("active");
    $(target).addClass("active"); 
    dataConfig["tabActiveDefault"] = target;
    saveLocalConfig();
})

$(document).ready(function () { 
    var dataConfigRaw = getLocalConfig(); 
    if (dataConfigRaw) {
        dataConfig = dataConfigRaw; 
        for (const prop in dataConfig) { 
            switch (prop) {
                case "tabActiveDefault":
                    $('.nav-link[data-target="' + dataConfig[prop] + '"]').click();
                    break; 
                case "check-reverse":
                case "check-find-picture":
                    $('[data-field="' + prop + '"]').prop("checked", dataConfig[prop])
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
                default:
                    dataConfig[field] = $(this).val();
                    break;
            }
           
            saveLocalConfig();
        });
    })
})
