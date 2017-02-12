const filters = []

const filterTypes = [
  {
    name: 'Property Value',
    options: {
      property: 'version',
      condition: 'equal',
      value: '1.0'
    },

    apply: (input, opts) => input.filter(x => {
      const propVal = x[opts.property]

      switch(opts.condition) {
        case 'equal':
          return propVal == opts.value
        case 'starts-with':
          return propVal.toString().startsWith(opts.value)
        case 'ends-with':
          return propVal.toString().endsWith(opts.value)
        case 'greater':
          return parseFloat(propVal) > parseFloat(opts.value)
        case 'less':
          return parseFloat(propVal) < parseFloat(opts.value)
      }
    }),

    buildParts: [
      {type: 'dropdown', option: 'property', choices: [
        ['coord', 'Coordinate'],
        ['encryptedCoord', 'Encrypted Coordinate'],
        ['intelligenceLayer', 'Intelligence Level'],
        ['version', 'Version']
      ]},
      {type: 'dropdown', option: 'condition', choices: [
        ['equal', 'is equal to'],
        ['starts-with', 'starts with'],
        ['ends-with', 'ends with'],
        ['greater', 'is greater than'],
        ['less', 'is less than']
      ]},
      {type: 'input', option: 'value'}
    ]
  }
]

function clearChildren(el) {
  while (el.firstChild) {
    el.firstChild.remove()
  }
}

function buildFilterList() {
  const filterList = document.getElementById('filter-list')

  clearChildren(filterList)

  for (let filter of filters) {
    const row = document.createElement('div')
    row.classList.add('control-row')

    for (let part of filter.buildParts) {
      if (typeof part === 'object') {

        if (part.type === 'dropdown') {
          const select = document.createElement('select')
          for (let optionLabel of part.choices) {
            const option = document.createElement('option')
            if (Array.isArray(optionLabel)) {
              option.value = optionLabel[0]
              option.appendChild(document.createTextNode(optionLabel[1]))
            } else {
              option.appendChild(document.createTextNode(optionLabel))
            }
            if (filter.optionValues[part.option] === option.value) {
              option.selected = true
            }
            select.appendChild(option)
          }
          Object.defineProperty(filter.optionValues, part.option, {
            get: () => select.value
          })
          select.addEventListener('change', () => applyFilters())
          row.appendChild(select)
        }

        else if (part.type === 'input') {
          const input = document.createElement('input')
          input.value = filter.optionValues[part.option]
          Object.defineProperty(filter.optionValues, part.option, {
            get: () => input.value
          })
          input.addEventListener('input', () => applyFilters())
          row.appendChild(input)
        }

        row.appendChild(document.createTextNode(' '))

      } else if (typeof part === 'string') {
        const node = document.createTextNode(part + ' ')
        row.appendChild(node)
      }
    }

    const rowControls = document.createElement('div')
    rowControls.classList.add('row-controls')

    const removeBtn = document.createElement('button')
    removeBtn.appendChild(document.createTextNode('-'))
    removeBtn.addEventListener('click', () => {
      removeFilter(filter)
    })
    rowControls.appendChild(removeBtn)

    row.appendChild(rowControls)

    filterList.appendChild(row)
  }
}

function addFilter(type) {
  const filter = Object.create(type)
  filter.optionValues = Object.assign({}, filter.options)
  filter.id = Math.random()
  filters.push(filter)

  buildFilterList()
  applyFilters()
}

function removeFilter(filter) {
  filters.splice(filters.indexOf(filter), 1)

  buildFilterList()
  applyFilters()
}

function applyFilters() {
  let array = window.subnetLocations

  for (let filter of filters) {
    array = filter.apply(array, filter.optionValues)
  }

  buildLocationTiles(array)
}

function buildLocationTiles(locations) {
  const locationList = document.getElementById('location-list')

  clearChildren(locationList)

  for (let location of locations) {
    const tile = document.createElement('div')
    tile.dataset.coordinate = location.coord
    tile.addEventListener('click', () => {
      focusLocation(location)
    })
    tile.classList.add('location-tile')

    const img = document.createElement('img')
    img.src = getTileImagePath(location)
    tile.appendChild(img)

    locationList.appendChild(tile)
  }
}

function focusLocation(location) {
  const setCellText = (id, text) => {
    const el = document.getElementById('details-' + id)
    clearChildren(el)
    el.appendChild(document.createTextNode(text))
  }

  document.getElementById('details-image').src = getTileImagePath(location)

  const title = document.getElementById('details-title')
  clearChildren(title)
  title.appendChild(document.createTextNode(location.coord + ' '))

  const wikiLink = document.createElement('a')
  wikiLink.target = '_blank'
  wikiLink.appendChild(document.createTextNode('(Wiki)'))
  wikiLink.href = getWikiLink(location)
  title.appendChild(wikiLink)

  setCellText('coord', location.coord)
  setCellText('encrypted-coord', location.encryptedCoord)
  setCellText('intelligence-level', location.intelligenceLayer)
  setCellText('version', location.version)
}

function getWikiLink(location) {
  return `http://submachine.wikia.com/wiki/${location.coord}`
}

function getTileImagePath(location) {
  return `img/tiles/${location.coord}.png`
}

function setupFilterBar() {
  const addFilterBtn = document.getElementById('add-filter-button')
  const applyFiltersBtn = document.getElementById('apply-filters-button')

  addFilterBtn.addEventListener('click', evt => {
    addFilter(filterTypes[0])
  })

  applyFiltersBtn.addEventListener('click', evt => {
    applyFilters()
  })
}
setupFilterBar()
buildLocationTiles(window.subnetLocations)
