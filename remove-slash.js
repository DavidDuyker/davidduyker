if (window.location.pathname.endsWith('/') && window.location.pathname !== '/') {
    // Store that we've already tried to redirect
    if (!sessionStorage.getItem('redirected')) {
        sessionStorage.setItem('redirected', 'true');
        window.location.href = window.location.href.slice(0, -1);
    }
}