const iconMap = {
    email: 'bi-envelope',
    discord: 'bi-discord',
    youtube: 'bi-youtube',
    twitch: 'bi-twitch',
    github: 'bi-github',
    nexusmods: 'bi-link-45deg',
    award: 'bi-award-fill'
};

const select = (selector, root = document) => root.querySelector(selector);

const createIcon = (type) => {
    const icon = document.createElement('i');
    icon.setAttribute('aria-hidden', 'true');
    icon.className = `icon ${iconMap[type] || 'bi-circle'}`;
    return icon;
};

const applyText = (element, text) => {
    if (!element) return;
    if (text) {
        element.textContent = text;
        element.hidden = false;
    } else {
        element.textContent = '';
        element.hidden = true;
    }
};

const renderAward = (fragment, award) => {
    const ribbon = select('.award-ribbon', fragment);
    const note = select('.award-note', fragment);

    if (!award) {
        ribbon.hidden = true;
        note.hidden = true;
        return;
    }

    const awardText = typeof award === 'string' ? award : award.text || '';
    const hasUrl = typeof award === 'object' && Boolean(award.url);

    ribbon.innerHTML = '';
    const ribbonLabel = document.createElement('div');
    ribbonLabel.className = 'ribbon-label';
    ribbonLabel.append(createIcon('award'));

    const ribbonText = document.createElement('span');
    ribbonText.className = 'label-text';
    ribbonText.textContent = 'Award';
    ribbonLabel.append(ribbonText);

    ribbon.append(ribbonLabel);
    ribbon.hidden = false;
    ribbon.title = awardText || 'Awarded project';

    note.innerHTML = '';
    note.append(createIcon('award'));

    const textNode = document.createElement(hasUrl ? 'a' : 'span');
    textNode.textContent = awardText;

    if (hasUrl) {
        textNode.href = award.url;
        textNode.target = '_blank';
        textNode.rel = 'noreferrer noopener';
    }

    note.append(textNode);
    note.hidden = !awardText;
};

const renderLinks = (container, links = []) => {
    container.innerHTML = '';

    if (!links.length) {
        container.hidden = true;
        return;
    }

    links.forEach((link) => {
        const anchor = document.createElement('a');
        anchor.className = 'btn';
        if (link.type === 'award') {
            anchor.classList.add('award');
        }
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noreferrer noopener';
        anchor.append(createIcon(link.type));

        const label = document.createElement('span');
        label.textContent = link.label;
        anchor.append(label);
        container.append(anchor);
    });

    container.hidden = false;
};

const renderProject = (project, template) => {
    const fragment = template.content.cloneNode(true);
    const tile = select('.tile', fragment);
    const background = select('.bg', fragment);

    if (project.bg) {
        background.src = project.bg;
        background.hidden = false;
    } else {
        background.hidden = true;
    }

    applyText(select('.tile-title', fragment), project.title);
    applyText(select('.summary', fragment), project.summary);

    renderAward(fragment, project.award);
    if (project.award) {
        tile.classList.add('awarded');
    }

    const metaParts = [project.client?.name, project.date].filter(Boolean);
    applyText(select('.meta', fragment), metaParts.join(' • '));

    const avatar = select('.client-avatar', fragment);
    if (project.client?.avatar) {
        avatar.src = project.client.avatar;
        avatar.hidden = false;
    } else {
        avatar.hidden = true;
    }

    applyText(select('.details', fragment), project.details);
    renderLinks(select('.links', fragment), project.links);

    return fragment;
};

const renderCategory = (category, templates, container) => {
    const fragment = templates.category.content.cloneNode(true);
    applyText(select('.category-title', fragment), category.name);

    const grid = select('.grid', fragment);
    category.projects.forEach((project) => {
        const projectNode = renderProject(project, templates.project);
        grid.append(projectNode);
    });

    container.append(fragment);
};

const renderContact = (contacts = []) => {
    const container = document.getElementById('contact');
    if (!container) return;
    container.innerHTML = '';

    contacts.forEach((item) => {
        const element = document.createElement(item.href ? 'a' : 'div');
        element.className = 'item';

        if (item.href) {
            element.href = item.href;
            if (item.external) {
                element.target = '_blank';
                element.rel = 'noreferrer noopener';
            }
        }

        element.append(createIcon(item.type));

        const text = document.createElement('span');
        text.textContent = item.label;
        element.append(text);

        container.append(element);
    });
};

const renderProfile = (profile) => {
    const avatar = document.getElementById('avatar');
    const username = document.getElementById('username');
    const footerName = document.getElementById('foot-name');
    const yearTarget = document.querySelector('[data-year]');

    if (avatar && profile.avatar) {
        avatar.src = profile.avatar;
        avatar.alt = profile.avatarAlt || 'Profile photo';
    }

    if (username) {
        username.textContent = profile.name || '';
    }

    if (footerName) {
        footerName.textContent = profile.footerName || profile.name || '';
    }

    if (yearTarget) {
        yearTarget.textContent = new Date().getFullYear();
    }

    renderContact(profile.contacts);
};

const renderPortfolio = (data) => {
    renderProfile(data.profile || {});

    const categoriesContainer = document.getElementById('categories');
    if (!categoriesContainer) return;
    categoriesContainer.innerHTML = '';

    const templates = {
        category: document.getElementById('category-tpl'),
        project: document.getElementById('tile-tpl')
    };

    (data.categories || []).forEach((category) => {
        renderCategory(category, templates, categoriesContainer);
    });
};

const loadPortfolio = async () => {
    try {
        const response = await fetch('portfolio-data.json');
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.status}`);
        }

        const data = await response.json();
        renderPortfolio(data);
    } catch (error) {
        console.error('Unable to initialise portfolio', error);
    }
};

document.addEventListener('DOMContentLoaded', loadPortfolio);
