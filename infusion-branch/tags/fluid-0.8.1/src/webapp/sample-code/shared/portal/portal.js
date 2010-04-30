/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/   

/*global jQuery, fluid */
var demo = demo || {};
    
(function (jQuery, fluid) {
    var grabHandle = function (item) {        
        // the handle is the toolbar. The toolbar id is the same as the portlet id, with the
        // "portlet_" prefix replaced by "toolbar_".
        return jQuery("[id=toolbar_" + item.id.split("_")[1] + "]");
    };

    
    var initPortletReorderer = function () {
        fluid.inlineEdit("#Pluto_5_u15l1n13_optionsForm", {selectors: {text: "#inline-editable"}});
        var options = { 
            styles:  {
                mouseDrag: "orderable-mouse-drag",
                dropMarker: "orderable-drop-marker-box",
                avatar: "orderable-avatar-clone"
            },
            selectors: {
                columns: "[id^='column']",
                modules: "[class^='portlet-container']",
                grabHandle: grabHandle,
                lockedModules: "#portlet_u15l1n10",
                dropWarning: jQuery("#drop-warning")
            }
        };

        return fluid.reorderLayout("#portalPageBodyColumns", options);
    };
    
    var initLightboxReorderer = function () {
        return fluid.lightbox("#gallery", {
            styles: {
                defaultStyle: "lb-orderable-default",
                selected: "lb-orderable-selected",
                dragging: "lb-orderable-dragging",
                mouseDrag: "lb-orderable-dragging",
                hover: "lb-orderable-hover",
                dropMarker: "lb-orderable-drop-marker",
                avatar: "lb-orderable-avatar"
            },
            selectors: {
                movables: "[id^=thumb-]"
            }
        });
    };
    
    /**
     * Skin settings for high contrast, large font skin
     */
    demo.hcLargeFontSkin = {
        textSize: "+3",
        textFont: "Courier",
        textSpacing: "Wide",
        colorScheme: "High Contrast",
        layout: "Default"
    };
    
    /**
     * Skin settings for high contrast, simple layout
     */
    demo.hcSimpleLayoutSkin = {
        textSize: "Default",
        textFont: "Default",
        textSpacing: "Default",
        colorScheme: "High Contrast",
        layout: "Simple"
    };

    /**
     * Skin settings for mist, small font skin
     */
    demo.mistSmallFontSkin = {
        textSize: "-1",
        textFont: "Default",
        textSpacing: "Default",
        colorScheme: "Mist",
        layout: "Default"
    };
    
    /**
     * Initialization script for dynamically changing skins
     */
    var initSkinChange = function () {
        jQuery("#hc-skin").click(function () {
            fluid.applySkin(demo.hcLargeFontSkin);
        });  
        
        jQuery("#hcs-skin").click(function () {
            fluid.applySkin(demo.hcSimpleLayoutSkin);
        });  

        jQuery("#mist-skin").click(function () {
            fluid.applySkin(demo.mistSmallFontSkin);
        });  

        jQuery("#remove-skin").click(function () {
            fluid.skin.removeStyling();
        });  

    };

    demo.initFluidComponents = function () {
        demo.portletReorderer = initPortletReorderer();
        demo.lightboxReorderer = initLightboxReorderer();
        initSkinChange();
    };
 
})(jQuery, fluid);

function testSpeeds() {
    var reps = 200;
    var time = new Date();
    for (var i = 0; i < reps; ++ i) {
        var it = fluid.jById("fluid.img.5");
    }
    var delay = (new Date() - time);
//  alert(delay);
    var usdelay = delay / (reps / 1000);
    fluid.log("jById: " + reps + " reps in " + delay + "ms: " + usdelay + "us/rep");
}

function testSpeeds2() {
    var reps = 100000;
    var time = new Date();
    for (var i = 0; i < reps; ++ i) {
        var it = document.getElementById("fluid.img.5");
        if (it.getAttribute("id") !== "fluid.img.5") {
            it = fluid.jById("fluid.img.2");
        }
    }
    var delay = (new Date() - time);
//  alert(delay);
    var usdelay = delay / (reps / 1000);
    fluid.log("document.byId: " + reps + " reps in " + delay + "ms: " + usdelay + "us/rep");
}

function testSpeeds3() {
    var reps = 100000;
    var time = new Date();
    var el = document.getElementById("fluid.img.5");
    for (var i = 0; i < reps; ++ i) {
        var it = jQuery.data(el);
    }
    var delay = (new Date() - time);
//  alert(delay);
    var usdelay = delay / (reps / 1000);
    fluid.log("document.byId: " + reps + " reps in " + delay + "ms: " + usdelay + "us/rep");
}