const iconMap = {
    email: 'bi-envelope',
    discord: 'bi-discord',
    youtube: 'bi-youtube',
    twitch: 'bi-twitch',
    github: 'bi-github',
    nexusmods: 'icon-nexusmods',
    itchio: 'fa-brands fa-itch-io',
    award: 'bi-award-fill',
    notable: 'bi-star-fill',
    web: "bi-globe",
    tool: "bi-tools"
};

function createIcon(type) {
    const icon = document.createElement('i');
    icon.setAttribute('aria-hidden', 'true');
    icon.className = `icon ${iconMap[type] || 'bi-circle'}`;
    return icon;
}