const contactContainer = document.getElementById('contact');
const categoriesContainer = document.getElementById('categories');
const categoryTemplate = document.getElementById('category-tpl');
const projectTemplate = document.getElementById('tile-tpl');

document.addEventListener('DOMContentLoaded', loadPortfolio);

async function loadPortfolio(){
    const profile = await (await fetch("data/profile.json")).json();
    renderProfile(profile);

    const clients = await (await fetch("data/clients.json")).json();
    const projects = await (await fetch("data/projects.json")).json();
    renderProjects(clients, projects);
}

/**
 * @param profile {{contacts: any[]}}
 */
function renderProfile(profile) {
    for (const item of profile.contacts) {
        const element = document.createElement(item.link ? 'a' : 'div');
        element.className = 'item';

        if (item.link) {
            element.href = item.link;
            element.target = '_blank';
            element.rel = 'noreferrer noopener';
        }

        element.append(createIcon(item.type));

        const text = document.createElement('span');
        text.textContent = item.label;
        element.append(text);

        contactContainer.append(element);
    }
}

/**
 * @param clients {any}
 * @param projects {any[]}
 */
function renderProjects(clients, projects){
    for (const category of projects) {
        renderCategory(clients, category);
    }
}

/**
 * @param clients {any}
 * @param category {{name: string, projects: any[]}}
 */
function renderCategory(clients, category) {
    const fragment = categoryTemplate.content.cloneNode(true);
    applyText(fragment.querySelector('.category-title'), category.name);

    const grid = fragment.querySelector('.grid');
    for (const project of category.projects) {
        const projectNode = renderProject(clients, project);
        if (projectNode) grid.append(projectNode);
    }

    if (grid.children.length !== 0) {
        categoriesContainer.append(fragment);
    }
}

/**
 * @param clients {{[client: string]: any}}
 * @param project {{title: string, summary: string?, bg: string?, bgIcon: string?, bgText: string?, details: string?, client: string, date: string, links: any[], hidden: boolean}}
 * @returns {Node | null}
 */
function renderProject(clients, project) {
    if (project.hidden) return null;

    const fragment = projectTemplate.content.cloneNode(true);
    const tile = fragment.querySelector('.tile');
    const background = fragment.querySelector('.bg');
    const placeholder = fragment.querySelector('.bg-placeholder');

    if (project.bg) {
        background.src = project.bg;
        background.hidden = false;
        placeholder.hidden = true;
        placeholder.innerHTML = '';
    } else {
        background.removeAttribute('src');
        background.hidden = true;

        let placeholderContent;
        if (project.bgIcon) {
            placeholderContent = createIcon(project.bgIcon);
        } else if (project.bgText) {
            placeholderContent = document.createElement('span');
            placeholderContent.textContent = project.bgText;
        }

        placeholder.innerHTML = '';

        if (placeholderContent) {
            placeholder.append(placeholderContent);
            placeholder.hidden = false;
        } else {
            placeholder.hidden = true;
        }
    }

    applyText(fragment.querySelector('.tile-title'), project.title);
    applyText(fragment.querySelector('.summary'), project.summary);

    tile.classList.remove('awarded', 'notable');

    renderAward(fragment, project.award);
    if (project.award && project.award.highlight) {
        tile.classList.add('awarded');
    }

    const notableActive = renderNotable(fragment, project.notable);
    if (notableActive) {
        tile.classList.add('notable');
    }

    /** @type {{name: string, avatar: string?, link: string?}} */
    const client = clients[project.client] || { name: project.client };

    const metaParts = [client.name, project.date].filter(Boolean);
    applyText(fragment.querySelector('.meta'), metaParts.join(' • '));

    const avatar = fragment.querySelector('.client-avatar');
    if (client.avatar) {
        avatar.src = client.avatar;
        avatar.hidden = false;
    } else {
        avatar.hidden = true;
    }

    applyText(fragment.querySelector('.details'), project.details);
    renderLinks(fragment.querySelector('.links'), project.links);

    return fragment;
}

const renderAward = (fragment, award) => {
    const ribbon = fragment.querySelector('.award-ribbon');
    const note = fragment.querySelector('.award-note');

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
    const ribbon = fragment.querySelector('.notable-ribbon');
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
