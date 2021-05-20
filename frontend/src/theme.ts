import {createMuiTheme, SimplePaletteColorOptions} from "@material-ui/core";
import {PaletteOptions} from "@material-ui/core/styles/createPalette";
import {green, red} from "@material-ui/core/colors";

let customColors = {
    white: "#ffffff",
    primary: '#79aec8',
    secondary: '#4db5ab',
    secondaryDark: '#055052',
    background: '#ededed',
    ariaSort: '#459ac4'
}

const palette: PaletteOptions = {
    primary: {
        main: customColors.primary,
        contrastText: customColors.white
    },
    secondary: {
        main: customColors.secondary,
        contrastText: customColors.white,
        dark: customColors.secondaryDark
    },
    background: {
        default: customColors.background
    },
    error: {
        main: red.A400,
        contrastText: customColors.white
    },
    success: {
        main: green["500"],
        contrastText: customColors.white
    }
}
const theme = createMuiTheme({
    palette,
    overrides: {
        MUIDataTable: {
            paper: {boxShadow: 'none'}
        },
        MUIDataTableToolbar: {
            root: {
                minHeight: '58px',
                backgroundColor: palette.background?.default
            },
            icon: {
                color: (palette.primary as SimplePaletteColorOptions).main,
                '&:hover, &:active, &:focus': {
                    color: customColors.secondaryDark
                }
            },
            iconActive: {
                color: customColors.secondaryDark,
                '&:hover, &:active, &:focus': {
                    color: customColors.secondaryDark
                }
            }

        },
        MUIDataTableHeadCell: {
            fixedHeader: {
                paddingTop: 8,
                paddingBottom: 8,
                backgroundColor: (palette.primary as SimplePaletteColorOptions).main,
                color: customColors.white,
                '&{aria-sort}': customColors.ariaSort
            },
            sortActive: {
                color: customColors.white
            },
            sortAction: {
                alignItems: 'center'
            },
            sortLabelRoot: {
                '& svg': {
                    color: customColors.white + ' !important'
                }
            }
        },
        MUIDataTableSelectCell: {
            headerCell: {
                backgroundColor: (palette.primary as SimplePaletteColorOptions).main,
                '& span': {
                    color: customColors.white + ' !important'
                }
            }

        },
        MUIDataTableBodyCell: {
            root: {
                color: (palette.secondary as SimplePaletteColorOptions).main,
                '&:hover, &:active, &:focus': {
                    color: (palette.secondary as SimplePaletteColorOptions).main,
                }
            }
        },
        MUIDataTableToolbarSelect: {
            title: {
                color: (palette.secondary as SimplePaletteColorOptions).main,
            },
            iconButton: {
                color: (palette.secondary as SimplePaletteColorOptions).main,
            }
        },
        MUIDataTableBodyRow: {
            root: {
                '&:nth-child(odd)': {
                    backgroundColor: customColors.background,
                }
            }
        },
        MUIDataTablePagination: {
            root: {
                color: (palette.secondary as SimplePaletteColorOptions).main,
            }
        },
        MUIDataTableFilterList: {
            root: {
                marginBottom: '16px'
            }
        }
    }
})

export default theme