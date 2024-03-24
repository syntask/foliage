// MYCELIUM v1.5 Updated to remove mill-finish from the options types for aluminum. -->

// POSTMESSAGE-BASED TOOL TO INTERFACE CHECKOUT UI ELEMENTS TO DYNAMIC 3D MODEL PREVIEW "FOLIAGE" -->

var width = 30;
var length = 72;
var height = 24;

function initializeEventListener() {
    var initialized = false; 

    var heightField0 = document.getElementsByName('properties[Dimensions-Height]')[0];
    var widthField0 = document.getElementsByName('properties[Dimensions-Width]')[0];
    var lengthField0 = document.getElementsByName('properties[Dimensions-Length]')[0];

    var heightField1 = document.getElementsByName('properties[Dimensions--Height]')[0];
    var widthField1 = document.getElementsByName('properties[Dimensions--Width]')[0];
    var lengthField1 = document.getElementsByName('properties[Dimensions--Length]')[0];

    var heightField2 = document.getElementsByName('properties[Dimensions---Height]')[0];
    var widthField2 = document.getElementsByName('properties[Dimensions---Width]')[0];
    var lengthField2 = document.getElementsByName('properties[Dimensions---Length]')[0];

    var heightField3 = document.getElementsByName('properties[Dimensions----Height]')[0];
    var widthField3 = document.getElementsByName('properties[Dimensions----Width]')[0];
    var lengthField3 = document.getElementsByName('properties[Dimensions----Length]')[0];

    var iFramePreview = document.getElementById('iframe3dpreview');

    var widthFields = [widthField0, widthField1, widthField2, widthField3];
    var lengthFields = [lengthField0, lengthField1, lengthField2, lengthField3];
    var heightFields = [heightField0, heightField1, heightField2, heightField3];


    widthFields.forEach((item, index) => {
        if (item && iFramePreview) {
            item.addEventListener('input', function() {
                width = item.value;
                iFramePreview.contentWindow.postMessage({width: width}, '*');
            });

            const config = { attributes: true, attributeFilter: ['disabled'] };
            const callback = function(mutationsList, observer) {
                for(let mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
                        if(item.disabled) {
                        } else {
                            item.value = width;
                            var event = new Event('input', {
                                bubbles: true,
                                cancelable: true,
                            });
                            item.dispatchEvent(event);
                        }
                    }
                }
            };
            const observer = new MutationObserver(callback);
            observer.observe(item, config);
            initialized = true;
        }
    });

    lengthFields.forEach((item, index) => {
        if (item && iFramePreview) {
            item.addEventListener('input', function() {
                length = item.value;
                iFramePreview.contentWindow.postMessage({length: length}, '*');
            });

            const config = { attributes: true, attributeFilter: ['disabled'] };
            const callback = function(mutationsList, observer) {
                for(let mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
                        if(item.disabled) {
                        } else {
                            item.value = length;
                            var event = new Event('input', {
                                bubbles: true,
                                cancelable: true,
                            });
                            item.dispatchEvent(event);
                        }
                    }
                }
            };
            const observer = new MutationObserver(callback);
            observer.observe(item, config);
            initialized = true;
        }
    });

    heightFields.forEach((item, index) => {
        if (item && iFramePreview) {
            item.addEventListener('input', function() {
                height = item.value;
                iFramePreview.contentWindow.postMessage({height: height}, '*');
            });

            const config = { attributes: true, attributeFilter: ['disabled'] };
            const callback = function(mutationsList, observer) {
                for(let mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
                        if(item.disabled) {
                        } else {
                            item.value = height;
                            var event = new Event('input', {
                                bubbles: true,
                                cancelable: true,
                            });
                            item.dispatchEvent(event);
                        }
                    }
                }
            };
            const observer = new MutationObserver(callback);
            observer.observe(item, config);
            initialized = true;
        }
    });

    if (initialized === true && iFramePreview) {
        const handleMutation = (mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {

                    //bed selector fields
                    if (document.getElementById('Planter type-0') && document.getElementById('Planter type-0').checked == true){
                        iFramePreview.contentWindow.postMessage({bed: "full"}, '*');
                    }
                    if (document.getElementById('Planter type-1') && document.getElementById('Planter type-1').checked == true){
                        iFramePreview.contentWindow.postMessage({bed: "mid"}, '*');
                    }
                    if (document.getElementById('Planter type-2') && document.getElementById('Planter type-2').checked == true){
                        iFramePreview.contentWindow.postMessage({bed: "none"}, '*');
                    }

                    //finish color selector fields
                    if (document.getElementById('Finish-0') && document.getElementById('Finish-0').checked == true){
                        iFramePreview.contentWindow.postMessage({material: "aluminumBlack"}, '*');
                    }
                    if (document.getElementById('Finish-1') && document.getElementById('Finish-1').checked == true){
                        iFramePreview.contentWindow.postMessage({material: "aluminumGray"}, '*');
                    }
                    if (document.getElementById('Finish-2') && document.getElementById('Finish-2').checked == true){
                        iFramePreview.contentWindow.postMessage({material: "aluminumWhite"}, '*');
                    }
                    if (document.getElementById('Finish-3') && document.getElementById('Finish-3').checked == true){
                        iFramePreview.contentWindow.postMessage({material: "aluminumTan"}, '*');
                    }
                    if (document.getElementById('Finish-4') && document.getElementById('Finish-4').checked == true){
                        iFramePreview.contentWindow.postMessage({material: "aluminumGreen"}, '*');
                    }
                    if (document.getElementById('Finish-5') && document.getElementById('Finish-5').checked == true){
                        iFramePreview.contentWindow.postMessage({material: "aluminumCustom"}, '*');
                    }

                    //Metal thickness fields
                    //Right now these are only used on COR-TEN planters so the thickness values are specific to the COR-TEN offerings.
                    //If thickness selectors are implemented on other metal types in the future, new fields with unique IDs should be generated for those. 
                    if (document.getElementById('Construction type-0') && document.getElementById('Construction type-0').checked == true){
                        iFramePreview.contentWindow.postMessage({thickness: 0.074}, '*');
                        iFramePreview.contentWindow.postMessage({shape: "type1"}, '*');
                    }
                    if (document.getElementById('Construction type-1') && document.getElementById('Construction type-1').checked == true){
                        iFramePreview.contentWindow.postMessage({thickness: 0.180}, '*');
                        iFramePreview.contentWindow.postMessage({shape: "type2"}, '*');
                    }
                }
            }
        };
        const config = {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ['class']
        };
        const elements = document.querySelectorAll('.tpo_color-swatches-input');
        elements.forEach((element) => {
            const observer = new MutationObserver(handleMutation);
            observer.observe(element, config);
        });

    }

    if (iFramePreview) {
        iFramePreview.contentWindow.postMessage({
            material: '{{product.metafields.custom.material_code.value}}',
        }, '*');
        iFramePreview.contentWindow.postMessage({
            shape: '{{product.metafields.custom.shape_code.value}}',
        }, '*');
        iFramePreview.contentWindow.postMessage({
            thickness: '{{product.metafields.custom.thickness.value}}',
        }, '*');
    }

    return initialized;
}

document.addEventListener('DOMContentLoaded', function() {
    if (!initializeEventListener()) {
        var observer = new MutationObserver(function(mutations) {
            if (initializeEventListener()) {
                observer.disconnect();
            }
        });

        var config = { childList: true, subtree: true };
        observer.observe(document.body, config);
    }
});
