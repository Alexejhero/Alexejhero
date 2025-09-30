const iconMap = {
    email: 'bi-envelope',
    discord: 'bi-discord',
    youtube: 'bi-youtube',
    twitch: 'bi-twitch',
    github: 'bi-github',
    nexusmods: 'icon-nexusmods',
    itchio: 'fa-brands fa-itch-io',
    award: 'bi-award-fill',
    notable: 'bi-star-fill'
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

    if (ribbon) {
        ribbon.innerHTML = '';
        ribbon.hidden = true;
        ribbon.removeAttribute('title');
    }

    if (!note) return;

    note.innerHTML = '';
    note.classList.remove('gold');

    if (!award) {
        note.hidden = true;
        return;
    }

    const awardText = typeof award === 'string' ? award : award.text || '';
    const hasUrl = typeof award === 'object' && Boolean(award.url);
    const highlight = typeof award === 'object' && Boolean(award.highlight);

    if (highlight && ribbon) {
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
    }

    if (highlight) {
        note.classList.add('gold');
    }

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

const renderNotable = (fragment, notable) => {
    const ribbon = select('.notable-ribbon', fragment);
    if (!ribbon) return false;

    ribbon.innerHTML = '';
    ribbon.hidden = true;
    ribbon.removeAttribute('title');

    const isActive = typeof notable === 'object' ? notable?.active !== false : Boolean(notable);
    if (!isActive) {
        return false;
    }

    const label = typeof notable === 'object' && notable.label ? notable.label : 'Notable';
    const title = typeof notable === 'object' && notable.title ? notable.title : 'Notable project';

    const ribbonLabel = document.createElement('div');
    ribbonLabel.className = 'ribbon-label';
    ribbonLabel.append(createIcon('notable'));

    const ribbonText = document.createElement('span');
    ribbonText.className = 'label-text';
    ribbonText.textContent = label;
    ribbonLabel.append(ribbonText);

    ribbon.append(ribbonLabel);
    ribbon.hidden = false;
    ribbon.title = title;

    return true;
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

    tile.classList.remove('awarded', 'notable');

    renderAward(fragment, project.award);
    if (project.award && project.award.highlight) {
        tile.classList.add('awarded');
    }

    const notableActive = renderNotable(fragment, project.notable);
    if (notableActive) {
        tile.classList.add('notable');
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
            element.target = '_blank';
            element.rel = 'noreferrer noopener';
        }

        element.append(createIcon(item.type));

        const text = document.createElement('span');
        text.textContent = item.label;
        element.append(text);

        container.append(element);
    });
};

const renderPortfolio = (data) => {
    renderContact(data.profile.contacts);

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
