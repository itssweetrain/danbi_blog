import { createGlobalStyle } from "styled-components"
import reset from "styled-reset"

const GlobalStyles = createGlobalStyle`
  ${reset}

  body {
    background: ${props => props.theme.colors.bodyBackground};
    font-family: Pretendard, apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;x
  }

  :not(pre) > code[class*="language-"], pre[class*="language-"] {
	  color: #fff;
    // background: #220B33;
  }
`

export default GlobalStyles
