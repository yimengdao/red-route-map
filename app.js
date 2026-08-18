// ============================================================
// 大龙乡红色文化旅游路线图 - 交互逻辑 v2
// ============================================================

(function() {
    "use strict";

    // ---- DOM refs ----
    var $ = function(id) { return document.getElementById(id); };

    // 图片加载完成 -> 移除骨架屏并淡入（增强视觉）
    document.addEventListener("load", function(e) {
        var t = e.target;
        if (t && t.tagName === "IMG") {
            t.classList.add("loaded");
            var slide = t.closest(".photo-slider-slide");
            if (slide) slide.classList.add("loaded");
        }
    }, true);

    var mapContainer = $("mapContainer");
    var infoOverlay = $("infoOverlay");
    var dialogTitle = $("dialogTitle");
    var dialogTag = $("dialogTag");
    var dialogYear = $("dialogYear");
    var dialogPhotoCount = $("dialogPhotoCount");
    var dialogDesc = $("dialogDesc");
    var dialogClose = $("dialogClose");
    var photoGallery = $("photoGallery");
    var galleryHint = $("galleryHint");
    var aiAnswer = $("aiAnswer");
    var lightbox = $("lightbox");
    var lightboxImg = $("lightboxImg");
    var lightboxCounter = $("lightboxCounter");
    var mobileDrawer = $("mobileDrawer");
    var drawerTitle = $("drawerTitle");
    var drawerPhotos = $("drawerPhotos");
    var drawerDesc = $("drawerDesc");
    var drawerDetailBtn = $("drawerDetailBtn");
    var mobileNavList = $("mobileNavList");
    var routeCards = $("routeCards");
    var toast = $("toast");
    var dialogPrevSite = $("dialogPrevSite");
    var dialogNextSite = $("dialogNextSite");
    var dialogSwitchInfo = $("dialogSwitchInfo");
    var drawerPrevSite = $("drawerPrevSite");
    var drawerNextSite = $("drawerNextSite");
    var drawerSwitchInfo = $("drawerSwitchInfo");
    var drawerCarousel = $("drawerCarousel");
    var drawerSliderTrack = $("drawerSliderTrack");
    var drawerSliderDots = $("drawerSliderDots");
    var drawerSliderCounter = $("drawerSliderCounter");
    var drawerSliderPrev = $("drawerSliderPrev");
    var drawerSliderNext = $("drawerSliderNext");
    var drawerPlayToggle = $("drawerPlayToggle");
    var drawerCloseBtn = $("drawerCloseBtn");
    var drawerScrim = $("drawerScrim");
    var drawerHandle = $("drawerHandle");
    var sliderPlayToggle = $("sliderPlayToggle");
    // Sub-gallery refs
    var subGallerySection = $("subGallerySection");
    var subGalleryTabs = $("subGalleryTabs");
    var subGalleryPhotos = $("subGalleryPhotos");
    var subGalleryDesc = $("subGalleryDesc");


var btnTour = $("btnTour");
    var btnReset = $("btnReset");
    var mapHint = $("mapHint");

    // Slider refs
    var photoSlider = $("photoSlider");
    var sliderTrack = $("sliderTrack");
    var sliderDots = $("sliderDots");
    var sliderCounter = $("sliderCounter");
    var sliderPrev = $("sliderPrev");
    var sliderNext = $("sliderNext");
    var sliderEmpty = $("sliderEmpty");
    var sliderProgress = $("sliderProgress");
    if (sliderPrev) sliderPrev.addEventListener("click", function(e) { slidePrev(e); });
    if (sliderNext) sliderNext.addEventListener("click", function(e) { slideNext(e); });
    if (sliderPlayToggle) sliderPlayToggle.addEventListener("click", function() {
        if (sliderAutoplay) { stopSliderAutoplay(); } else { startSliderAutoplay(); }
    });

    // State
    var currentSite = null;
    var lbPhotos = [];
    var lbIdx = 0;
    var tourTimer = null;
    var sliderAutoplay = null;

    function startSliderAutoplay() {
        stopSliderAutoplay();
        if (sldTotal <= 1) return;
        if (sliderProgress) {
            sliderProgress.classList.remove("running");
            void sliderProgress.offsetWidth;
            sliderProgress.classList.add("running");
        }
        if (sliderPlayToggle) sliderPlayToggle.textContent = "\u23F8";
        sliderAutoplay = setInterval(function() {
            sldIdx = (sldIdx + 1) % sldTotal;
            sliderTrack.style.transform = "translateX(-" + (sldIdx * 100) + "%)";
            sliderCounter.textContent = (sldIdx + 1) + " / " + sldTotal;
            updateSliderDots();
            ensureSlideLoaded(sldIdx);
        }, 6000);
    }

    function stopSliderAutoplay() {
        if (sliderAutoplay) { clearInterval(sliderAutoplay); sliderAutoplay = null; }
        if (sliderProgress) { sliderProgress.classList.remove("running"); sliderProgress.style.width = "0"; }
        if (sliderPlayToggle) sliderPlayToggle.textContent = "\u25B6";
    }

    function updateSliderDots() {
        var dots = sliderDots.querySelectorAll(".dot");
        dots.forEach(function(d, i) { d.classList.toggle("active", i === sldIdx); });
    }
    var tourIdx = -1;
    var sldIdx = 0;
    var sldTotal = 0;
    var isMobile = window.innerWidth <= 900;
    var hintHidden = false;

    // ---- Validate critical DOM ----
    function checkDom() {
        var critical = [mapContainer, infoOverlay, dialogTitle, photoSlider, sliderTrack, photoGallery, lightbox, mobileNavList, routeCards, toast];
        var missing = [];
        critical.forEach(function(el, i) {
            if (!el) missing.push(["mapContainer","infoOverlay","dialogTitle","photoSlider","sliderTrack","photoGallery","lightbox","mobileNavList","routeCards","toast"][i]);
        });
        if (missing.length > 0) {
            console.error("DOM missing: " + missing.join(", "));
            return false;
        }
        console.log("DOM OK - " + critical.length + " elements ready");
        return true;
    }

    if (!checkDom()) {
        document.body.innerHTML = '<div style="color:#f00;padding:40px;text-align:center"><h2>页面加载异常</h2><p>请检查文件完整性或使用 python server.py 启动</p></div>';
        return;
    }

    // ---- Build hotspots ----
    SITES.forEach(function(site) {
        var dot = document.createElement("div");
        dot.className = "hotspot";
        dot.setAttribute("data-id", site.id);
        dot.style.left = site.left;
        dot.style.top = site.top;
        dot.innerHTML = '<span class="num">' + site.id + '</span><span class="hotspot-label">' + site.name + '</span><span class="tooltip">' + site.name + '</span>';
        dot.addEventListener("click", function() { selectSite(site.id); });
        mapContainer.appendChild(dot);
    });
    console.log("Hotspots: " + SITES.length + " placed");

    // ---- Draw route line through hotspots (in SITES order) ----
    function drawRouteLine() {
        var path = document.querySelector("#routeLine path");
        if (!path) return;
        var pts = SITES.map(function(s) { return { x: parseFloat(s.left), y: parseFloat(s.top) }; });
        var d = "M" + pts[0].x + "," + pts[0].y;
        for (var i = 1; i < pts.length; i++) {
            var mx = (pts[i-1].x + pts[i].x) / 2;
            d += " C" + mx + "," + pts[i-1].y + " " + mx + "," + pts[i].y + " " + pts[i].x + "," + pts[i].y;
        }
        path.setAttribute("d", d);
    }
    drawRouteLine();

    // ---- Fill dynamic route stats ----
    var statSites = $("statSites"), statPhotos = $("statPhotos");
    if (statSites) statSites.textContent = SITES.length;
    if (statPhotos) statPhotos.textContent = SITES.reduce(function(n, s) { return n + (s.photos ? s.photos.length : 0); }, 0);
    var statSites2 = $("statSites2"), statPhotos2 = $("statPhotos2");
    if (statSites2) statSites2.textContent = SITES.length;
    if (statPhotos2) statPhotos2.textContent = SITES.reduce(function(n, s) { return n + (s.photos ? s.photos.length : 0); }, 0);

    // ---- Build route cards ----
    SITES.forEach(function(site) {
        var card = document.createElement("div");
        card.className = "route-card";
        card.setAttribute("data-id", site.id);
        var nc = site.id === "01" ? "start" : (site.id === "05" ? "end" : "waypoint");
        card.innerHTML = '<div class="route-card-num ' + nc + '">' + site.id + '</div>' +
            '<div class="route-card-info"><div class="route-card-name">' + site.name + '</div>' +
            '<div class="route-card-type">' + site.type + '</div></div>' +
            '<span class="route-card-arrow">\u203a</span>';
        card.addEventListener("click", function() { selectSite(site.id); });
        routeCards.appendChild(card);
    });
    console.log("Route cards: " + SITES.length + " built");

    // ---- Build mobile nav ----
    SITES.forEach(function(site) {
        var item = document.createElement("div");
        item.className = "mobile-nav-item";
        item.setAttribute("data-id", site.id);
        item.innerHTML = '<div class="mobile-nav-item-name">' + site.name + '</div><div>' + site.short + '</div>';
        item.addEventListener("click", function() { isMobile = true; selectSite(site.id); });
        mobileNavList.appendChild(item);
    });
    console.log("Mobile nav: " + SITES.length + " items");

    // ---- Select site ----
    function selectSite(id) {
        var site = SITES.find(function(s) { return s.id === id; });
        if (!site) { console.warn("Site not found: " + id); return; }
        currentSite = site;
        console.log("Selected: " + site.name + " (photos: " + site.photos.length + ")");

        // Hide hint on first click
        if (!hintHidden && mapHint) { mapHint.style.opacity = "0"; mapHint.style.transition = "opacity 0.5s"; hintHidden = true; }

        // Update active states
        document.querySelectorAll(".hotspot,.route-card,.mobile-nav-item").forEach(function(el) { el.classList.remove("active"); });
        var ad = document.querySelector('.hotspot[data-id="' + id + '"]');
        if (ad) ad.classList.add("active");
        var ac = document.querySelector('.route-card[data-id="' + id + '"]');
        if (ac) ac.classList.add("active");
        var ai = document.querySelector('.mobile-nav-item[data-id="' + id + '"]');
        if (ai) { ai.classList.add("active"); ai.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }

        // 更新点位切换指示
        var _ci = SITES.findIndex(function(s) { return s.id === id; });
        var _pos = (_ci >= 0 ? _ci + 1 : 1) + " / " + SITES.length;
        if (dialogSwitchInfo) dialogSwitchInfo.textContent = _pos;
        if (drawerSwitchInfo) drawerSwitchInfo.textContent = _pos;

        if (subGallerySection) { subGallerySection.style.display = (site.id === "04") ? "block" : "none"; }
        if (isMobile) { showMobileDrawer(site); } else { showInfoDialog(site); }
    }

    // ---- Show info dialog ----
    function showInfoDialog(site) {
        console.log("showInfoDialog: " + site.name);

        try { dialogTitle.textContent = site.name; } catch(e) { console.error("dialogTitle error", e); }
        try { dialogTag.textContent = "#" + site.id + " " + site.short; } catch(e) {}
        try { dialogYear.textContent = site.year + "\u5e74"; } catch(e) {}
        try { dialogPhotoCount.textContent = "\u5171 " + site.photos.length + " \u5f20\u7167\u7247"; } catch(e) {}
        try { dialogDesc.textContent = site.desc; } catch(e) {}

        buildPhotoSlider(site);
        buildPhotoGallery(site);
        buildSubGallery(site);
        // For site 04, auto-expand sub-gallery and show guide
        if (site.id === "04" && subGallerySection && !site.photos.length) {
            subGallerySection.style.display = "block";
            if (sliderEmpty) {
                sliderEmpty.innerHTML = '<span class="ph-icon" style="font-size:2rem">📚</span><span style="font-size:.85rem;color:var(--gold)">课程活动展示</span><span style="font-size:.65rem;color:var(--text-dim)">请从下方选择课程查看照片</span>';
            }
        }
        resetAI();
        // Hide AI section if no API keys configured
        var aiSection = document.querySelector(".ai-section");
        if (aiSection) {
            aiSection.style.display = (APP_CONFIG.zhipuApiKey || APP_CONFIG.kimiApiKey) ? "block" : "none";
        }
        infoOverlay.classList.add("visible");
        console.log("Dialog visible, slider built with " + sldTotal + " slides");
    }

    
    // ---- Build sub-gallery for site 04 ----
    var currentSubIdx = 0;
    var currentSubPhotos = [];
    var currentSubSite = null;

    function buildSubGallery(site) {
        if (!subGallerySection || !subGalleryTabs || !subGalleryPhotos) return;

        if (!site.subGalleries || site.subGalleries.length === 0) {
            subGallerySection.style.display = "none";
            return;
        }

        currentSubSite = site;
        subGallerySection.style.display = "block";
        subGalleryTabs.innerHTML = "";
        subGalleryPhotos.innerHTML = "";
        currentSubIdx = 0;
        subGalleryTabs.style.flexWrap = "wrap";
        subGalleryTabs.style.maxHeight = "none";
        subGalleryTabs.style.overflowY = "visible";

        // Remove old back button
        var oldBack = subGallerySection.querySelector(".sub-gallery-back");
        if (oldBack) oldBack.remove();

        // Add back button
        var backBtn = document.createElement("span");
        backBtn.className = "sub-gallery-back";
        backBtn.textContent = "← 收起课程";
        backBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            var collapsed = subGallerySection.classList.toggle("collapsed");
            if (collapsed) {
                subGalleryTabs.style.display = "none";
                subGalleryPhotos.style.display = "none";
                if (subGalleryDesc) subGalleryDesc.style.display = "none";
                backBtn.textContent = "▶ 展开课程";
                if (photoSlider) photoSlider.scrollIntoView({ behavior: "smooth" });
            } else {
                subGalleryTabs.style.display = "flex";
                subGalleryPhotos.style.display = "flex";
                if (subGalleryDesc) subGalleryDesc.style.display = "block";
                backBtn.textContent = "← 收起课程";
            }
        });
        subGallerySection.insertBefore(backBtn, subGallerySection.firstChild);

        // Build tabs
        site.subGalleries.forEach(function(sg, i) {
            var tab = document.createElement("span");
            tab.className = "sub-gallery-tab" + (i === 0 ? " active" : "");
            tab.textContent = sg.icon + " " + sg.name;
            tab.setAttribute("data-idx", String(i));
            tab.style.cursor = "pointer";
            tab.addEventListener("click", function(e) {
                e.stopPropagation();
                var newIdx = parseInt(this.getAttribute("data-idx"), 10);
                if (isNaN(newIdx)) return;
                currentSubIdx = newIdx;
                updateSubGalleryTabs();
                renderSubPhotos();
                console.log("Sub-gallery tab clicked: " + newIdx + " -> " + (currentSubSite ? currentSubSite.subGalleries[newIdx].name : "?"));
            });
            subGalleryTabs.appendChild(tab);
        });

        renderSubPhotos();
        console.log("Sub-gallery built: " + site.subGalleries.length + " tabs");
    }

    function updateSubGalleryTabs() {
        var tabs = subGalleryTabs.querySelectorAll(".sub-gallery-tab");
        tabs.forEach(function(t, i) {
            t.classList.toggle("active", i === currentSubIdx);
        });
    }

    function renderSubPhotos() {
        if (!currentSubSite || !currentSubSite.subGalleries) return;
        var sg = currentSubSite.subGalleries[currentSubIdx];
        if (!sg) return;
        currentSubPhotos = sg.photos || [];
        subGalleryPhotos.innerHTML = "";
        if (subGalleryDesc) subGalleryDesc.textContent = sg.desc || "";

        console.log("renderSubPhotos: " + sg.name + " (" + currentSubPhotos.length + " photos)");

        if (currentSubPhotos.length === 0) {
            subGalleryPhotos.innerHTML = '<span style="color:var(--text-muted);font-size:.7rem;padding:10px">暂无照片</span>';
            return;
        }

        var maxSub = Math.min(currentSubPhotos.length, 50);
        for (var i = 0; i < maxSub; i++) {
            var src = currentSubPhotos[i];
            var img = document.createElement("img");
            img.src = src;
            img.alt = sg.name + " - " + (i + 1);
            img.loading = "lazy"; img.decoding = "async";
            img.style.cursor = "pointer";
            (function(idx) {
                img.addEventListener("click", function(e) {
                    e.stopPropagation();
                    openLightbox(currentSubPhotos, idx);
                });
            })(i);
            img.addEventListener("error", function() {
                this.style.display = "none";
            });
            subGalleryPhotos.appendChild(img);
        }
    }

    // ---- 轮播按需加载：仅加载当前与下一张，降低首屏流量 ----
    function ensureSlideLoaded(i) {
        if (!sliderTrack || sldTotal === 0) return;
        [i, i + 1].forEach(function(n) {
            if (n < 0 || n >= sldTotal) return;
            var slide = sliderTrack.children[n];
            if (!slide) return;
            var img = slide.querySelector("img");
            if (img && img.getAttribute("data-src") && !img.getAttribute("src")) {
                img.src = img.getAttribute("data-src");
            }
        });
    }

    // ---- Build photo slider ----
    function buildPhotoSlider(site) {
        if (!sliderTrack || !sliderDots || !sliderCounter || !sliderEmpty) {
            console.error("Slider DOM missing!");
            return;
        }
        stopSliderAutoplay();
        sliderTrack.innerHTML = "";
        sliderDots.innerHTML = "";
        sldIdx = 0;
        sldTotal = 0;
        if (sliderEmpty) {
            sliderEmpty.innerHTML = '<span class="ph-icon">&#128247;</span><span>暂无照片</span><span style="font-size:.6rem;color:var(--text-muted)">该点位暂未收录照片</span>';
        }

        if (!site.photos || site.photos.length === 0) {
            sliderEmpty.style.display = "flex";
            sliderTrack.style.display = "none";
            sliderCounter.textContent = "0 / 0";
            if (sliderPrev) sliderPrev.style.display = "none";
            if (sliderNext) sliderNext.style.display = "none";
            sldTotal = 0;
            return;
        }

        sliderEmpty.style.display = "none";
        sliderTrack.style.display = "flex";
        if (sliderPrev) sliderPrev.style.display = "flex";
        if (sliderNext) sliderNext.style.display = "flex";

        var maxSlides = Math.min(site.photos.length, 100);
        for (var i = 0; i < maxSlides; i++) {
            var src = site.photos[i];
            var slide = document.createElement("div");
            slide.className = "photo-slider-slide";
            var img = document.createElement("img");
            img.setAttribute("data-src", src);
            img.alt = site.name + " - " + (i + 1);
            img.decoding = "async";
            img.style.cursor = "pointer";
            (function(idx) {
                img.addEventListener("click", function(e) {
                    e.stopPropagation();
                    openLightbox(site.photos, idx);
                });
                img.addEventListener("error", function() {
                    var sl = this.closest(".photo-slider-slide");
                    if (sl) sl.classList.add("img-error");
                    this.style.display = "none";
                });
            })(i);
            slide.appendChild(img);
            sliderTrack.appendChild(slide);

            var dot = document.createElement("span");
            dot.className = "dot" + (i === 0 ? " active" : "");
            (function(idx) {
                dot.addEventListener("click", function() { goToSlide(idx); });
            })(i);
            sliderDots.appendChild(dot);
        }

        sldTotal = maxSlides;
        sliderCounter.textContent = "1 / " + sldTotal;
        ensureSlideLoaded(0);
        startSliderAutoplay();

        // Touch swipe
        var tsX = 0;
        sliderTrack.addEventListener("touchstart", function(e) { tsX = e.changedTouches[0].screenX; stopSliderAutoplay(); }, {passive: true});
        sliderTrack.addEventListener("touchend", function(e) {
            var diff = tsX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) { if (diff > 0) slideNext(e); else slidePrev(e); }
        }, {passive: true});
    }
    function goToSlide(idx) {
        if (sldTotal === 0) return;
        sldIdx = Math.max(0, Math.min(idx, sldTotal - 1));
        sliderTrack.style.transform = "translateX(-" + (sldIdx * 100) + "%)";
        sliderCounter.textContent = (sldIdx + 1) + " / " + sldTotal;
        updateSliderDots();
        ensureSlideLoaded(sldIdx);
        stopSliderAutoplay();
    }

    function slidePrev(e) {
        if (e) e.stopPropagation();
        if (sldTotal === 0) return;
        stopSliderAutoplay();
        sldIdx = (sldIdx - 1 + sldTotal) % sldTotal;
        sliderTrack.style.transform = "translateX(-" + (sldIdx * 100) + "%)";
        sliderCounter.textContent = (sldIdx + 1) + " / " + sldTotal;
        updateSliderDots();
        ensureSlideLoaded(sldIdx);
    }

    function slideNext(e) {
        if (e) e.stopPropagation();
        if (sldTotal === 0) return;
        stopSliderAutoplay();
        sldIdx = (sldIdx + 1) % sldTotal;
        sliderTrack.style.transform = "translateX(-" + (sldIdx * 100) + "%)";
        sliderCounter.textContent = (sldIdx + 1) + " / " + sldTotal;
        updateSliderDots();
        ensureSlideLoaded(sldIdx);
    }

function buildPhotoGallery(site) {
        if (!photoGallery) return;
        photoGallery.innerHTML = "";

        if (!site.photos || site.photos.length === 0) {
            var grads = ["linear-gradient(135deg,#2c1810,#4a3020)","linear-gradient(135deg,#1a2a1a,#2a4a2a)","linear-gradient(135deg,#1a1a2e,#2a2a4e)"];
            for (var i = 0; i < 3; i++) {
                var ph = document.createElement("div");
                ph.className = "photo-thumb placeholder";
                ph.style.background = grads[i];
                ph.title = "\u6682\u65E0\u7167\u7247";
                photoGallery.appendChild(ph);
            }
            if (galleryHint) galleryHint.textContent = "\u{1F4F7} \u8BE5\u5730\u70B9\u6682\u65E0\u7167\u7247\uFF0C\u53EF\u5728 photos_web \u6587\u4EF6\u5939\u4E2D\u6DFB\u52A0";
        } else {
            site.photos.forEach(function(src, idx) {
                var ph = document.createElement("div");
                ph.className = "photo-thumb";
                var img = document.createElement("img");
                img.src = src;
                img.alt = site.name;
                img.loading = "lazy"; img.decoding = "async";
                img.addEventListener("error", function() {
                    ph.className = "photo-thumb placeholder";
                    ph.style.background = "linear-gradient(135deg,#2c1810,#4a3020)";
                    ph.textContent = "\u274C";
                    ph.title = "\u52A0\u8F7D\u5931\u8D25: " + src;
                });
                ph.appendChild(img);
                ph.addEventListener("click", function(e) { e.stopPropagation(); openLightbox(site.photos, idx); });
                photoGallery.appendChild(ph);
            });
            if (galleryHint) galleryHint.textContent = "\u{1F449} \u70B9\u51FB\u7F29\u7565\u56FE\u53EF\u653E\u5927\u67E5\u770B \u{1F50D}  \u5171 " + site.photos.length + " \u5F20";
        }
        console.log("Gallery built: " + (site.photos ? site.photos.length : 0) + " thumbs");
    }

    // ---- Lightbox ----
    function openLightbox(photos, idx) {
        stopSliderAutoplay();
        stopDrawerAutoplay();
        lbPhotos = photos;
        lbIdx = idx;
        lightboxImg.src = photos[idx];
        if (lightboxCounter) lightboxCounter.textContent = (idx + 1) + " / " + photos.length;
        lightbox.classList.add("visible");
        pauseTourForLightbox();
        console.log("Lightbox: " + (idx + 1) + "/" + photos.length);
    }

    function closeLightbox() { lightbox.classList.remove("visible"); lbPhotos = []; resumeTourAfterLightbox(); }

    function lbPrev(e) { e.stopPropagation(); if (lbPhotos.length === 0) return; lbIdx = (lbIdx - 1 + lbPhotos.length) % lbPhotos.length; lightboxImg.src = lbPhotos[lbIdx]; if (lightboxCounter) lightboxCounter.textContent = (lbIdx+1) + " / " + lbPhotos.length; }
    function lbNext(e) { e.stopPropagation(); if (lbPhotos.length === 0) return; lbIdx = (lbIdx + 1) % lbPhotos.length; lightboxImg.src = lbPhotos[lbIdx]; if (lightboxCounter) lightboxCounter.textContent = (lbIdx+1) + " / " + lbPhotos.length; }

    lightbox.addEventListener("click", function(e) {
        if (e.target === lightbox || e.target.classList.contains("lightbox-close")) closeLightbox();
    });

    var lbPrevBtn = document.querySelector(".lightbox-prev");
    var lbNextBtn = document.querySelector(".lightbox-next");
    if (lbPrevBtn) lbPrevBtn.addEventListener("click", lbPrev);
    if (lbNextBtn) lbNextBtn.addEventListener("click", lbNext);
    if (lightboxImg) lightboxImg.addEventListener("error", function() {
        lightboxImg.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#1a1410"/><text x="50%" y="50%" fill="#9a8c7a" font-size="16" text-anchor="middle">\u56FE\u7247\u52A0\u8F7D\u5931\u8D25</text></svg>');
    });

    // ---- Dialog close ----
    if (dialogClose) dialogClose.addEventListener("click", function() { infoOverlay.classList.remove("visible"); if (subGallerySection) subGallerySection.style.display = "none"; stopSliderAutoplay(); });
    infoOverlay.addEventListener("click", function(e) {
        if (e.target !== infoOverlay) return;
        infoOverlay.classList.remove("visible");
        if (subGallerySection) subGallerySection.style.display = "none";
        stopSliderAutoplay();
    });

    // ---- Mobile drawer ----
    function showMobileDrawer(site) {
        drawerTitle.textContent = site.name;
        drawerDesc.textContent = site.desc;
        drawerPhotos.innerHTML = "";
        buildDrawerSlider(site);
        drawerPhotos.style.display = (site.photos && site.photos.length > 0) ? "flex" : "none";
        if (site.photos && site.photos.length > 0) {
            site.photos.slice(0, 8).forEach(function(src) {
                var img = document.createElement("img");
                img.src = src;
                img.alt = site.name;
                img.loading = "lazy"; img.decoding = "async";
                img.addEventListener("click", function() {
                    var i = site.photos.indexOf(src);
                    openLightbox(site.photos, i >= 0 ? i : 0);
                });
                img.addEventListener("error", function() { this.style.display = "none"; });
                drawerPhotos.appendChild(img);
            });
        }
        mobileDrawer.classList.add("open");
        if (drawerScrim) drawerScrim.classList.add("visible");
        console.log("Mobile drawer: " + site.name);
    }

    if (drawerDetailBtn) drawerDetailBtn.addEventListener("click", function() {
        if (!currentSite) return;
        showInfoDialog(currentSite);
        mobileDrawer.classList.remove("open");
    });

    // ---- 点位快速切换（上一个/下一个） ----
    function switchSite(dir) {
        if (!currentSite) return;
        var i = SITES.findIndex(function(s) { return s.id === currentSite.id; });
        if (i < 0) return;
        var n = (i + dir + SITES.length) % SITES.length;
        var wrapped = (dir === 1 && n === 0) || (dir === -1 && n === SITES.length - 1);
        selectSite(SITES[n].id);
        if (wrapped) toastMsg(dir === 1 ? "已回到起点：双坪村" : "已到终点：红军崖纪念碑");
    }
    if (dialogPrevSite) dialogPrevSite.addEventListener("click", function() { switchSite(-1); });
    if (dialogNextSite) dialogNextSite.addEventListener("click", function() { switchSite(1); });
    if (drawerPrevSite) drawerPrevSite.addEventListener("click", function() { switchSite(-1); });
    if (drawerNextSite) drawerNextSite.addEventListener("click", function() { switchSite(1); });

    // ---- 移动端抽屉自动轮播 ----
    var dIdx = 0, dTotal = 0, dAutoplay = null;
    function stopDrawerAutoplay() {
        if (dAutoplay) { clearInterval(dAutoplay); dAutoplay = null; }
        if (drawerPlayToggle) drawerPlayToggle.textContent = "\u25B6";
    }
    function startDrawerAutoplay() {
        stopDrawerAutoplay();
        if (dTotal <= 1) return;
        dAutoplay = setInterval(function() {
            dIdx = (dIdx + 1) % dTotal;
            dGo(dIdx, false);
        }, 6000);
        if (drawerPlayToggle) drawerPlayToggle.textContent = "\u23F8";
    }
    function drawerEnsure(i) {
        if (!drawerSliderTrack || dTotal === 0) return;
        [i, i + 1].forEach(function(n) {
            if (n < 0 || n >= dTotal) return;
            var slide = drawerSliderTrack.children[n];
            if (!slide) return;
            var img = slide.querySelector("img");
            if (img && img.getAttribute("data-src") && !img.getAttribute("src")) {
                img.src = img.getAttribute("data-src");
            }
        });
    }
    function dGo(idx, user) {
        if (dTotal === 0) return;
        dIdx = Math.max(0, Math.min(idx, dTotal - 1));
        if (drawerSliderTrack) drawerSliderTrack.style.transform = "translateX(-" + (dIdx * 100) + "%)";
        if (drawerSliderCounter) drawerSliderCounter.textContent = (dIdx + 1) + " / " + dTotal;
        var dots = drawerSliderDots ? drawerSliderDots.querySelectorAll(".dot") : [];
        dots.forEach(function(d, i) { d.classList.toggle("active", i === dIdx); });
        drawerEnsure(dIdx);
        if (user) stopDrawerAutoplay();
    }
    function dPrev(e) { if (e) e.stopPropagation(); if (dTotal === 0) return; dGo((dIdx - 1 + dTotal) % dTotal, true); }
    function dNext(e) { if (e) e.stopPropagation(); if (dTotal === 0) return; dGo((dIdx + 1) % dTotal, true); }
    if (drawerSliderPrev) drawerSliderPrev.addEventListener("click", dPrev);
    if (drawerSliderNext) drawerSliderNext.addEventListener("click", dNext);
    if (drawerPlayToggle) drawerPlayToggle.addEventListener("click", function() {
        if (dAutoplay) { stopDrawerAutoplay(); } else { startDrawerAutoplay(); }
    });
    var dtsX = 0;
    if (drawerSliderTrack) {
        drawerSliderTrack.addEventListener("touchstart", function(e) { dtsX = e.changedTouches[0].screenX; stopDrawerAutoplay(); }, {passive: true});
        drawerSliderTrack.addEventListener("touchend", function(e) {
            var diff = dtsX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 40) { if (diff > 0) dNext(e); else dPrev(e); }
        }, {passive: true});
    }
    function buildDrawerSlider(site) {
        if (!drawerSliderTrack) return;
        drawerSliderTrack.innerHTML = "";
        if (drawerSliderDots) drawerSliderDots.innerHTML = "";
        dIdx = 0; dTotal = 0; stopDrawerAutoplay();
        var photos = site.photos || [];
        if (photos.length === 0) {
            drawerSliderTrack.innerHTML = '<div class="drawer-empty"><span style="font-size:1.6rem">\u{1F4DA}</span><span>\u8BE5\u70B9\u4F4D\u4E3A\u8BFE\u7A0B\u6D3B\u52A8\u5C55\u793A\uFF0C\u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u67E5\u770B\u8BFE\u7A0B\u7167\u7247</span></div>';
            if (drawerSliderCounter) drawerSliderCounter.textContent = "0 / 0";
            return;
        }
        var maxSlides = Math.min(photos.length, 50);
        for (var i = 0; i < maxSlides; i++) {
            var slide = document.createElement("div");
            slide.className = "photo-slider-slide";
            var img = document.createElement("img");
            img.setAttribute("data-src", photos[i]);
            img.alt = site.name + " - " + (i + 1);
            img.decoding = "async";
            (function(idx) {
                img.addEventListener("click", function(e) { e.stopPropagation(); openLightbox(photos, idx); });
                img.addEventListener("error", function() {
                    var sl = this.closest(".photo-slider-slide");
                    if (sl) sl.classList.add("img-error");
                    this.style.display = "none";
                });
            })(i);
            slide.appendChild(img);
            drawerSliderTrack.appendChild(slide);
            if (drawerSliderDots) {
                var dot = document.createElement("span");
                dot.className = "dot" + (i === 0 ? " active" : "");
                (function(idx) { dot.addEventListener("click", function() { dGo(idx, true); }); })(i);
                drawerSliderDots.appendChild(dot);
            }
        }
        dTotal = maxSlides;
        if (drawerSliderCounter) drawerSliderCounter.textContent = "1 / " + dTotal;
        drawerEnsure(0);
        startDrawerAutoplay();
    }

    // ---- 移动端抽屉关闭（按钮/遮罩/下拉） ----
    function closeDrawer() {
        mobileDrawer.classList.remove("open");
        if (drawerScrim) drawerScrim.classList.remove("visible");
        stopDrawerAutoplay();
        document.querySelectorAll(".hotspot,.route-card,.mobile-nav-item").forEach(function(el) { el.classList.remove("active"); });
        currentSite = null;
    }
    if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);
    if (drawerScrim) drawerScrim.addEventListener("click", closeDrawer);
    var dDragY = null, dDragging = false;
    if (drawerHandle) {
        drawerHandle.addEventListener("touchstart", function(e) { dDragY = e.touches[0].clientY; dDragging = false; mobileDrawer.classList.add("dragging"); }, {passive: true});
        drawerHandle.addEventListener("touchmove", function(e) {
            if (dDragY === null) return;
            var dy = e.touches[0].clientY - dDragY;
            if (dy > 0) { dDragging = true; mobileDrawer.style.transform = "translateY(" + dy + "px)"; }
        }, {passive: true});
        drawerHandle.addEventListener("touchend", function(e) {
            if (dDragY === null) return;
            var dy = (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : dDragY) - dDragY;
            mobileDrawer.classList.remove("dragging");
            mobileDrawer.style.transform = "";
            dDragY = null;
            if (dDragging && dy > 70) closeDrawer();
            dDragging = false;
        }, {passive: true});
    }

    // ---- AI Q&A ----
    function resetAI() { aiAnswer.classList.remove("visible", "loading"); aiAnswer.textContent = ""; }

    var aiBtns = $("aiBtns");
    if (aiBtns) aiBtns.addEventListener("click", function(e) {
        if (!e.target.classList.contains("ai-btn")) return;
        if (!currentSite) return;

        var q = e.target.getAttribute("data-q");
        var prompts = {
            historical: '\u8BF7\u4ECB\u7ECD"' + currentSite.name + '"\uFF08\u798F\u5EFA\u7701\u6CF0\u5B81\u53BF\u5927\u9F99\u4E61\uFF09\u7684\u5386\u53F2\u80CC\u666F\u3002',
            travel: '\u8BF7\u4ECB\u7ECD"' + currentSite.name + '"\u7684\u65C5\u6E38\u653B\u7565\u548C\u4EA4\u901A\u65B9\u5F0F\u3002',
            story: '\u8BF7\u8BB2\u8FF0\u4E00\u4E2A\u4E0E"' + currentSite.name + '"\u76F8\u5173\u7684\u7EA2\u8272\u9769\u547D\u6545\u4E8B\u3002'
        };

        aiAnswer.classList.add("visible", "loading");
        aiAnswer.textContent = "AI \u6B63\u5728\u751F\u6210\u56DE\u7B54...";

        var key = (typeof APP_CONFIG !== "undefined" && APP_CONFIG.zhipuApiKey) ? APP_CONFIG.zhipuApiKey : "";
        var msgs = [{ role: "user", content: prompts[q] }];
        function renderAI(d) {
            aiAnswer.classList.remove("loading");
            aiAnswer.textContent = d.choices[0].message.content;
        }
        // \u4F18\u5148\u8D70\u672C\u5730\u4EE3\u7406 (server.py)\uFF0Ckey \u4E0D\u7528\u66B4\u9732\u5728\u6D4F\u89C8\u5668\uFF1B\u4EE3\u7406\u4E0D\u53EF\u7528\u65F6\u56DE\u9000\u76F4\u8FDE
        fetch("api/ai/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: msgs })
        })
        .then(function(r) { if (!r.ok) throw new Error("proxy unavailable"); return r.json(); })
        .then(renderAI)
        .catch(function() {
            if (!key) {
                aiAnswer.classList.remove("loading");
                aiAnswer.textContent = "\u672A\u914D\u7F6E API \u5BC6\u94A5\uFF08config.js \u6216 server.py\uFF09\uFF0C\u5176\u4F59\u529F\u80FD\u6B63\u5E38\u4F7F\u7528\u3002";
                return;
            }
            var url = (typeof APP_CONFIG !== "undefined" && APP_CONFIG.zhipuApiUrl) ? APP_CONFIG.zhipuApiUrl : "https://open.bigmodel.cn/api/paas/v4/chat/completions";
            var model = (typeof APP_CONFIG !== "undefined" && APP_CONFIG.zhipuModel) ? APP_CONFIG.zhipuModel : "glm-4-flash";
            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
                body: JSON.stringify({ model: model, messages: msgs, temperature: 0.7, max_tokens: 500 })
            })
            .then(function(r) { return r.json(); })
            .then(renderAI)
            .catch(function() { aiAnswer.classList.remove("loading"); aiAnswer.textContent = "\u62B1\u6B49\uFF0CAI \u56DE\u7B54\u751F\u6210\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5\u3002"; });
        });
    });

    // ---- Tour mode ----
    btnTour.addEventListener("click", function() {
        if (tourTimer) { stopTour(); btnTour.innerHTML = "\u25B6 \u81EA\u52A8\u5BFC\u89C8"; btnTour.classList.remove("btn-red"); btnTour.classList.add("btn-outline"); toastMsg("\u5BFC\u89C8\u5DF2\u505C\u6B62"); return; }
        startTour();
    });

    function startTour() {
        tourIdx = 0;
        btnTour.innerHTML = "\u25A0 \u505C\u6B62\u5BFC\u89C8";
        btnTour.classList.remove("btn-outline");
        btnTour.classList.add("btn-red");
        toastMsg("\u5BFC\u89C8\u5F00\u59CB...");
        advanceTour();
    }

    function advanceTour() {
        if (tourIdx >= SITES.length) {
            stopTour();
            btnTour.innerHTML = "\u25B6 \u81EA\u52A8\u5BFC\u89C8";
            btnTour.classList.remove("btn-red");
            btnTour.classList.add("btn-outline");
            toastMsg("\u5BFC\u89C8\u7ED3\u675F\uFF0C\u611F\u8C22\u89C2\u770B\uFF01");
            return;
        }
        selectSite(SITES[tourIdx].id);
        toastMsg("(" + (tourIdx + 1) + "/" + SITES.length + ") " + SITES[tourIdx].name);
        tourIdx++;
        tourTimer = setTimeout(advanceTour, 4000);
    }

    function stopTour() { if (tourTimer) { clearTimeout(tourTimer); tourTimer = null; } tourIdx = -1; }
    var tourPaused = false;
    var tourPausedRemaining = 0;
    var tourPausedAt = 0;
    function pauseTourForLightbox() {
        if (!tourTimer) return;
        tourPaused = true;
        tourPausedAt = Date.now();
        clearTimeout(tourTimer);
        tourTimer = null;
    }
    function resumeTourAfterLightbox() {
        if (!tourPaused) return;
        tourPaused = false;
        var elapsed = Date.now() - tourPausedAt;
        var remaining = Math.max(500, 4000 - elapsed);
        tourTimer = setTimeout(advanceTour, remaining);
    }

    btnReset.addEventListener("click", function() {
        stopTour();
        btnTour.innerHTML = "\u25B6 \u81EA\u52A8\u5BFC\u89C8";
        btnTour.classList.remove("btn-red");
        btnTour.classList.add("btn-outline");
        infoOverlay.classList.remove("visible"); if (subGallerySection) subGallerySection.style.display = "none"; stopSliderAutoplay();
        mobileDrawer.classList.remove("open");
        if (drawerScrim) drawerScrim.classList.remove("visible");
        stopDrawerAutoplay();
        document.querySelectorAll(".hotspot,.route-card,.mobile-nav-item").forEach(function(el) { el.classList.remove("active"); });
        currentSite = null;
        if (mapHint) { mapHint.style.opacity = "1"; hintHidden = false; }
        toastMsg("\u5DF2\u91CD\u7F6E\u4E3A\u603B\u89C8\u89C6\u56FE");
    });

    // ---- Keyboard ----
    document.addEventListener("keydown", function(e) {
        if (lightbox.classList.contains("visible")) {
            if (e.key === "ArrowLeft") lbPrev(e);
            if (e.key === "ArrowRight") lbNext(e);
            if (e.key === "Escape") closeLightbox();
            return;
        }
        if (e.key === "Escape") {
            infoOverlay.classList.remove("visible"); if (subGallerySection) subGallerySection.style.display = "none"; stopSliderAutoplay();
            mobileDrawer.classList.remove("open");
            if (drawerScrim) drawerScrim.classList.remove("visible");
            stopDrawerAutoplay();
            stopTour();
        }
        if (infoOverlay.classList.contains("visible")) {
            if (e.key === "ArrowLeft") { goToSlide(sldIdx - 1); return; }
            if (e.key === "ArrowRight") { goToSlide(sldIdx + 1); return; }
        }
        var num = parseInt(e.key);
        if (num >= 1 && num <= 6) { selectSite(num < 10 ? "0" + num : "" + num); }
    });

    // ---- Toast ----
    function toastMsg(msg) {
        toast.textContent = msg;
        toast.classList.add("visible");
        clearTimeout(toast._tid);
        toast._tid = setTimeout(function() { toast.classList.remove("visible"); }, 2500);
    }

    // ---- Resize ----
    window.addEventListener("resize", function() { isMobile = window.innerWidth <= 900; });

    // ---- Init log ----
    var totalPhotos = SITES.reduce(function(sum, s) { return sum + (s.photos ? s.photos.length : 0); }, 0);
    console.log("\u2705 \u5927\u9F99\u4E61\u7EA2\u8272\u6587\u5316\u65C5\u6E38\u8DEF\u7EBF\u56FE v2 \u5DF2\u5C31\u7EEA");
    console.log("   " + SITES.length + " \u4E2A\u70B9\u4F4D | " + totalPhotos + " \u5F20\u7167\u7247 | " + (isMobile ? "\u624B\u673A" : "\u684C\u9762") + "\u6A21\u5F0F");
    console.log("   \u70B9\u51FB\u5730\u56FE\u70ED\u70B9\u6216\u4FA7\u8FB9\u680F\u5361\u7247\u5F00\u59CB\u63A2\u7D22");
    console.log("   \u952E\u76D8: 1-6 \u5FEB\u901F\u8DF3\u8F6C | \u2190\u2192 \u7FFB\u9875 | ESC \u5173\u95ED");


    // ---- Drag-to-edit mode (press E to toggle) ----
    var editMode = false;
    var dragTarget = null;
    var dragStartX = 0, dragStartY = 0;
    var dragStartLeft = 0, dragStartTop = 0;

    function toggleEditMode() {
        editMode = !editMode;
        var dots = document.querySelectorAll(".hotspot");
        dots.forEach(function(d) {
            d.style.cursor = editMode ? "move" : "pointer";
            d.style.borderColor = editMode ? "#0f0" : "#fff";
            d.title = editMode ? "拖拽移动 | 按E退出编辑" : "";
        });
        toastMsg(editMode ? "编辑模式: 拖拽热点调整位置 | 按S输出坐标 | 按E退出" : "编辑模式已退出");
        console.log(editMode ? "EDIT MODE ON - drag hotspots, press S to print positions" : "Edit mode off");
    }

    function getPercent(el, prop) {
        return parseFloat(el.style[prop]) || 0;
    }

    document.addEventListener("mousedown", function(e) {
        if (!editMode) return;
        var hotspot = e.target.closest(".hotspot");
        if (!hotspot) return;
        e.preventDefault();
        dragTarget = hotspot;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartLeft = getPercent(hotspot, "left");
        dragStartTop = getPercent(hotspot, "top");
        hotspot.style.zIndex = "50";
        hotspot.style.transition = "none";
    });

    document.addEventListener("mousemove", function(e) {
        if (!dragTarget) return;
        var container = mapContainer.getBoundingClientRect();
        var dx = ((e.clientX - dragStartX) / container.width) * 100;
        var dy = ((e.clientY - dragStartY) / container.height) * 100;
        var newLeft = Math.max(0, Math.min(100, dragStartLeft + dx));
        var newTop = Math.max(0, Math.min(100, dragStartTop + dy));
        dragTarget.style.left = newLeft + "%";
        dragTarget.style.top = newTop + "%";
        dragTarget.querySelector(".tooltip").textContent =
            dragTarget.getAttribute("data-id") + ": " + newLeft.toFixed(1) + "%, " + newTop.toFixed(1) + "%";
    });

    document.addEventListener("mouseup", function() {
        if (!dragTarget) return;
        dragTarget.style.zIndex = "10";
        dragTarget.style.transition = "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        var id = dragTarget.getAttribute("data-id");
        var left = getPercent(dragTarget, "left");
        var top = getPercent(dragTarget, "top");
        console.log("POS:", id, "-> left:", left.toFixed(1) + "%, top:", top.toFixed(1) + "%");
        dragTarget = null;
    });

    // Touch support for mobile
    document.addEventListener("touchstart", function(e) {
        if (!editMode) return;
        var hotspot = e.target.closest(".hotspot");
        if (!hotspot) return;
        e.preventDefault();
        dragTarget = hotspot;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        dragStartLeft = getPercent(hotspot, "left");
        dragStartTop = getPercent(hotspot, "top");
        hotspot.style.zIndex = "50";
        hotspot.style.transition = "none";
    }, {passive: false});

    document.addEventListener("touchmove", function(e) {
        if (!dragTarget) return;
        var container = mapContainer.getBoundingClientRect();
        var dx = ((e.touches[0].clientX - dragStartX) / container.width) * 100;
        var dy = ((e.touches[0].clientY - dragStartY) / container.height) * 100;
        dragTarget.style.left = Math.max(0, Math.min(100, dragStartLeft + dx)) + "%";
        dragTarget.style.top = Math.max(0, Math.min(100, dragStartTop + dy)) + "%";
    }, {passive: false});

    document.addEventListener("touchend", function() {
        if (!dragTarget) return;
        dragTarget.style.zIndex = "10";
        dragTarget.style.transition = "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        var id = dragTarget.getAttribute("data-id");
        console.log("POS:", id, "-> left:", getPercent(dragTarget,"left").toFixed(1) + "%, top:", getPercent(dragTarget,"top").toFixed(1) + "%");
        dragTarget = null;
    });

    // Add E key for edit mode, S key to print all positions
    var origKeydown = document.onkeydown;
    document.addEventListener("keydown", function(e) {
        if (e.key === "e" && !e.ctrlKey && !e.metaKey && !lightbox.classList.contains("visible") && !infoOverlay.classList.contains("visible")) {
            toggleEditMode();
            return;
        }
        if (e.key === "s" && editMode) {
            console.log("===== CURRENT POSITIONS =====");
            document.querySelectorAll(".hotspot").forEach(function(d) {
                var id = d.getAttribute("data-id");
                var l = getPercent(d, "left").toFixed(1);
                var t = getPercent(d, "top").toFixed(1);
                console.log('{id:"' + id + '", left:"' + l + '%", top:"' + t + '%"},');
            });
            console.log("===== COPY ABOVE TO SITES ARRAY =====");
            toastMsg("坐标已输出到控制台 (F12查看)");
            return;
        }
    });

})();
