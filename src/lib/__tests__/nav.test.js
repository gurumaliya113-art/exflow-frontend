import { describe, it, expect } from 'vitest'

import { resolveActiveNav, normalizePath, BRAND_NAV_ID } from '../nav'
import { PUBLIC_NAV, LEGACY_NAV } from '../../content/site'

describe('normalizePath', () => {
  it('keeps a plain path unchanged', () => {
    expect(normalizePath('/portfolio')).toBe('/portfolio')
  })

  it('strips trailing slashes but keeps the root', () => {
    expect(normalizePath('/about/')).toBe('/about')
    expect(normalizePath('/about///')).toBe('/about')
    expect(normalizePath('/')).toBe('/')
  })

  it('strips query and hash fragments', () => {
    expect(normalizePath('/blogs?page=2')).toBe('/blogs')
    expect(normalizePath('/blogs#top')).toBe('/blogs')
    expect(normalizePath('/blogs/?a=1#top')).toBe('/blogs')
    expect(normalizePath('/#work')).toBe('/')
  })

  it('falls back to the root for empty and non-string input', () => {
    expect(normalizePath('')).toBe('/')
    expect(normalizePath('   ')).toBe('/')
    expect(normalizePath(undefined)).toBe('/')
    expect(normalizePath(null)).toBe('/')
    expect(normalizePath(42)).toBe('/')
  })

  it('adds a missing leading slash', () => {
    expect(normalizePath('contact')).toBe('/contact')
  })
})

describe('resolveActiveNav', () => {
  it('returns brand for the home route', () => {
    expect(resolveActiveNav('/', PUBLIC_NAV)).toBe(BRAND_NAV_ID)
    expect(resolveActiveNav('/?utm=x', PUBLIC_NAV)).toBe(BRAND_NAV_ID)
    expect(resolveActiveNav('/#hero', PUBLIC_NAV)).toBe(BRAND_NAV_ID)
  })

  it('returns the matching id for every public route', () => {
    for (const item of PUBLIC_NAV) {
      expect(resolveActiveNav(item.to, PUBLIC_NAV)).toBe(item.id)
    }
  })

  it('ignores trailing slashes, query strings, and hashes when matching', () => {
    expect(resolveActiveNav('/portfolio/', PUBLIC_NAV)).toBe('work')
    expect(resolveActiveNav('/solutions?ref=footer', PUBLIC_NAV)).toBe('solutions')
    expect(resolveActiveNav('/about#team', PUBLIC_NAV)).toBe('about')
    expect(resolveActiveNav('/contact/?a=1#form', PUBLIC_NAV)).toBe('contact')
  })

  it('returns null for paths that are not in the nav', () => {
    expect(resolveActiveNav('/enquire', PUBLIC_NAV)).toBeNull()
    expect(resolveActiveNav('/partner', PUBLIC_NAV)).toBeNull()
    expect(resolveActiveNav('/home-old', PUBLIC_NAV)).toBeNull()
    expect(resolveActiveNav('/nope/deep', PUBLIC_NAV)).toBeNull()
  })

  it('is case-sensitive on paths', () => {
    expect(resolveActiveNav('/Portfolio', PUBLIC_NAV)).toBeNull()
  })

  it('resolves duplicate destinations to the first item in config order', () => {
    const duplicates = LEGACY_NAV.filter((item) => item.to === '/enquire')
    expect(duplicates).toHaveLength(2)
    expect(resolveActiveNav('/enquire', LEGACY_NAV)).toBe(duplicates[0].id)
  })

  it('treats the legacy hash destination as the home route', () => {
    expect(resolveActiveNav('/#work', LEGACY_NAV)).toBe(BRAND_NAV_ID)
    expect(resolveActiveNav('/work', LEGACY_NAV)).toBeNull()
  })

  it('resolves the remaining legacy destinations to their own ids', () => {
    expect(resolveActiveNav('/partner', LEGACY_NAV)).toBe('l-solutions')
    expect(resolveActiveNav('/partner-benefits', LEGACY_NAV)).toBe('l-industries')
    expect(resolveActiveNav('/work-benefits', LEGACY_NAV)).toBe('l-about')
  })

  it('returns brand for empty or missing pathnames', () => {
    expect(resolveActiveNav('', PUBLIC_NAV)).toBe(BRAND_NAV_ID)
    expect(resolveActiveNav(undefined, PUBLIC_NAV)).toBe(BRAND_NAV_ID)
  })

  it('returns at most one identifier and tolerates a missing nav config', () => {
    expect(resolveActiveNav('/portfolio', undefined)).toBeNull()
    expect(resolveActiveNav('/portfolio', [])).toBeNull()

    const matches = PUBLIC_NAV.filter(
      (item) => normalizePath(item.to) === normalizePath('/industries')
    )
    expect(matches).toHaveLength(1)
    expect(resolveActiveNav('/industries', PUBLIC_NAV)).toBe(matches[0].id)
  })
})
