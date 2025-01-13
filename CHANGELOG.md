

## [1.1.2](https://github.com/MorevM/bem-classnames/compare/v1.1.1...v1.1.2) (2025-01-13)


### CI improvements

* Add latest changelog entry to Github release ([f561c2b](https://github.com/MorevM/bem-classnames/commit/f561c2bd7eaa112bb861724ddd24cbc63375a167))


### Bug fixes

* Do not count an empty string as a modifier ([ac8322d](https://github.com/MorevM/bem-classnames/commit/ac8322d2edf32da93951254a50ee2a72d434c146))
* **types:** Allow `null`/`undefined` to be passed as mixins ([6da1356](https://github.com/MorevM/bem-classnames/commit/6da1356ad4476c283ea48619ececcc58f06e9038))


### Tests

* Add test cases for empty modifiers ([32e3eeb](https://github.com/MorevM/bem-classnames/commit/32e3eeb612675b66c896132ee480448ed81d9787))
* More type-safety for tests ([46a7440](https://github.com/MorevM/bem-classnames/commit/46a7440511de28140c877fdf42cf43f1f93e13e8))


## [1.1.1](https://github.com/MorevM/bem-classnames/compare/v1.1.0...v1.1.1) (2024-03-03)


### Bug fixes

* **types:** Duplicate JSDoc on top of interfaces ([c8cae35](https://github.com/MorevM/bem-classnames/commit/c8cae35d03162d2dba8a77badcff487196253cfd))

## [1.1.0](https://github.com/MorevM/bem-classnames/compare/v1.0.2...v1.1.0) (2024-03-02)


### Features

* Export module types ([6f91928](https://github.com/MorevM/bem-classnames/commit/6f919284b891c09746e79d18f63e185cf0841355))


## [1.0.2](https://github.com/MorevM/bem-classnames/compare/v1.0.1...v1.0.2) (2024-02-04)


### Chores

* Grant write permissions to GH actions ([c16bade](https://github.com/MorevM/bem-classnames/commit/c16bade9b1fabdc9309bd7148a54ce7a2660b345))

## [1.0.0](https://github.com/MorevM/bem-classnames/compare/v1.0.3...v2.0.0) (2024-01-12)

This release description enumerates the significant changes from the previous package [more-bem-classnames](https://github.com/MorevM/more-bem-classnames).

### ⚠ BREAKING CHANGES

* The package `@morev/more-bem-classnames` is declared obsolete.
  Use `@morev/bem-classnames` (this package) instead.
* There is no default export anymore.
  Use named export `{ bemClassnames }` instead.
* The library is not transpiled anymore, also there is no UMD export.
