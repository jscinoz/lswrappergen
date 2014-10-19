(function() {
    var cache = {},
        listenerMap = {
            ".menu-toggle": {
                events: "touchstart click",
                handler: deghost(menuButtonHandler)
            }
        },
        relocationMap = {
            "#localist-menu-container .action_menu li:not(.search_action)":
                "#main-menu",
            "#localist-menu-container .action_menu li.search_action":
                "#search-container"
        };

    function $_cached(selector, forceUpdate) {
        if (!cache[selector] || forceUpdate) cache[selector] = $(selector);

        return cache[selector];
    }

    function init() {
        relocateElements();
        registerEventHandlers();
    }

    function relocateElements() {
        var selector, target, newParent;

        for (selector in relocationMap) if (relocationMap.hasOwnProperty(selector)) {
            $(selector).prependTo(relocationMap[selector]);
        }
    }

    function registerEventHandlers() {
        var listener, selector; 

        for (selector in listenerMap) if (listenerMap.hasOwnProperty(selector)) {
            listener = listenerMap[selector];

            $_cached(selector).on(listener.events, listener.handler);
        }
    }

    function deghost(handler) {
        return function(e) {
            e.preventDefault();

            handler.call(this, e);
        };
    }

    function menuButtonHandler(e) {
        var $targetMenu = $_cached($(this).data("menu"));

        if ($targetMenu.hasClass("open")) {
            $targetMenu.removeClass("open");
        } else {
            $targetMenu.addClass("open");
        }
    }

    $(init);
})();
