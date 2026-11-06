// goku_engine.js
(function() {
    if (window.GOKU_ENGINE_LOADED) return;
    window.GOKU_ENGINE_LOADED = true;
    
    window.GOKU_ACTIVE = false;
    window.GOKU_TARGET = null;
    window.GOKU_AMOUNT = 10;
    window.GOKU_LAST_PERIOD = '';

    // --- YOUR CORE FUNCTIONS ---
    function dispatchForceClick(node) {
        if (!node) return;
        try { node.click(); } catch(e){}
        ['pointerdown','mousedown','pointerup','mouseup'].forEach(function(evt){
            try { node.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window })); } catch(e){}
        });
        try {
            var rect = node.getBoundingClientRect();
            var x = rect.left + rect.width / 2;
            var y = rect.top + rect.height / 2;
            var touchObj = new Touch({ identifier: Date.now(), target: node, clientX: x, clientY: y, screenX: x, screenY: y, pageX: x, pageY: y });
            node.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true, touches: [touchObj] }));
            setTimeout(function() { node.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true, touches: [] })); }, 50);
        } catch(e) {}
    }

    function findBetButton(target) {
        var cls = target.charAt(0).toUpperCase() + target.slice(1).toLowerCase();
        var selector = '.bet_item.' + cls;
        var allBtns = document.querySelectorAll(selector);
        for(var i=0; i<allBtns.length; i++){
            if(allBtns[i].getClientRects().length) return allBtns[i];
        }
        return null;
    }

    function setBetAmountOn(inputField, amount) {
        if(!inputField) return;
        try {
            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(inputField, String(amount));
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
            inputField.dispatchEvent(new Event('change', { bubbles: true }));
        } catch(e) {}
    }

    // --- MAIN API FOR JAVA ---
    window.GOKU_START = function(target, amount) {
        window.GOKU_ACTIVE = true;
        window.GOKU_TARGET = target;
        window.GOKU_AMOUNT = amount;
        console.log("GOKU Bot Started: " + target + " @ " + amount);
    };

    window.GOKU_STOP = function() {
        window.GOKU_ACTIVE = false;
        console.log("GOKU Bot Stopped");
    };

    window.GOKU_BALANCE = function() {
        var e = document.querySelector('.Wallet__C-balance-l1 div') || document.body.innerText.match(/₹[\d,]+\.\d{2}/);
        if(!e) return "0.00";
        var txt = e.innerText ? e.innerText : e[0];
        return txt.replace(/[^\d.]/g, '');
    };

    // --- AUTO BET LOOP ---
    setInterval(function() {
        if (!window.GOKU_ACTIVE) return;

        // 1. Detect new period
        var pEl = document.querySelector('.K3TL__C-l2 .periodNo');
        var period = pEl ? pEl.innerText.trim() : '';

        // If period changes and we haven't bet on it yet
        if (period && window.GOKU_LAST_PERIOD !== period) {
            window.GOKU_LAST_PERIOD = period;
            
            // Wait 2 sec after period change to place bet
            setTimeout(function() {
                var btn = findBetButton(window.GOKU_TARGET);
                if (!btn) return;

                dispatchForceClick(btn); // Open popup

                setTimeout(function() {
                    var inp = document.querySelector('.Betting__Popup-input');
                    if (inp) {
                        setBetAmountOn(inp, window.GOKU_AMOUNT);
                        
                        setTimeout(function() {
                            var chk = document.querySelector('.betPopup .van-checkbox');
                            if (chk && chk.getAttribute('aria-checked') !== 'true') dispatchForceClick(chk);
                            
                            var conf = document.querySelector('.betPopup .bet-foot-s');
                            dispatchForceClick(conf);
                            console.log("GOKU: Bet Placed!");
                        }, 500);

                    } else {
                        // Close stuck popup
                        var cancel = document.querySelector('.betPopup .bet-foot-c');
                        if(cancel) dispatchForceClick(cancel);
                    }
                }, 600);
            }, 2000); // 2 second delay
        }
    }, 1000); // Check every second
})();
