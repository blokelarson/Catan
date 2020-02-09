class Gui {
  constructor(contentWidth, contentHeight, leftSidebarOpen, rightSidebarOpen) {
    this.contentWidth = contentWidth;
    this.contentHeight = contentHeight;
    this.leftSidebarOpen = leftSidebarOpen;
    this.rightSidebarOpen = rightSidebarOpen;
    this.realSize = 0;
    this.leftSidebarWidth = 0;
    this.rightSidebarWidth = 0;

    this.smallBorderSize =  2;
    this.mediumBorderSize = 2;
    this.largeBorderSize = 4;

    this.initalize();
  }

  initalize() {
    this.initialize_small_borders();
    this.initialize_medium_borders();
    this.initialize_large_borders();
    this.initialize_board();
    this.initialize_left_sidebar();
    this.initialize_right_sidebar();

    this.initialize_left_sidebar_button();
    this.initialize_right_sidebar_button();

    this.initialize_card_count_container();
    this.initialize_main_button_container();
    this.initialize_popup();
  }


  initialize_board() {
    this.initialize_board_canvas_container();
    this.initialize_board_canvas();
  }

  initialize_popup() {
    let canvas = document.getElementById("constant-canvas");
    let canvasContainer = document.getElementById("board-canvas-container");
    let popup = document.getElementsByClassName("popup")[0];

    popup.style.width = canvas.width + "px";
    popup.style.left = this.leftSidebarWidth + parseInt(canvasContainer.style.borderWidth, 10) + "px";
  }

  initialize_icon_container() {
    let padding = (this.contentWidth * 0.00625) * 0.75;
    let container = document.getElementById("icon-container");
    container.style.padding = padding + "px";
  }

  initialize_small_borders() {
    let elements = document.getElementsByClassName("small-border");
    for(let i = 0; i < elements.length; ++i) {
      let element = elements[i];
      element.style.borderWidth = this.smallBorderSize + "px";
    }
  }

  initialize_medium_borders() {
    let elements = document.getElementsByClassName("medium-border");
    for(let i = 0; i < elements.length; ++i) {
      let element = elements[i];
      element.style.borderWidth = this.mediumBorderSize + "px";
    }
  }

  initialize_large_borders() {
    let elements = document.getElementsByClassName("large-border");
    for(let i = 0; i < elements.length; ++i) {
      let element = elements[i];
      element.style.borderWidth = this.largeBorderSize + "px";
    }
  }


  initialize_card_count_container() {
    let container = document.getElementById("card-count-container");
    let boardContainer = document.getElementById("board-canvas-container");

    let totalWidth = this.realSize * 0.5;
    let totalHeight = this.contentHeight * 0.08;
    let xOffset = this.leftSidebarWidth + (parseInt(boardContainer.style.width, 10) / 2) - totalWidth / 2;
    let yOffset = this.contentHeight - totalHeight;

    let contentWidth = totalWidth - this.mediumBorderSize * 2;
    let contentHeight = totalHeight - this.mediumBorderSize * 2;

    container.style.width = contentWidth + "px";
    container.style.height = contentHeight + "px";
    container.style.left = xOffset + "px";
    container.style.top = yOffset + "px";
  }

  initialize_main_button_container() {
    let container = document.getElementById("main-button-container");
    let boardContainer = document.getElementById("board-canvas-container");

    let totalWidth = this.realSize * 0.5;
    let totalHeight = this.contentHeight * 0.08;
    let xOffset = this.leftSidebarWidth + (parseInt(boardContainer.style.width, 10) / 2) - totalWidth / 2;
    let yOffset = 0;

    let contentWidth = totalWidth - this.mediumBorderSize * 2;
    let contentHeight = totalHeight - this.mediumBorderSize * 2;

    container.style.width = contentWidth + "px";
    container.style.height = contentHeight + "px";
    container.style.left = xOffset + "px";
    container.style.top = yOffset + "px";
  }

  initialize_board_canvas_container() {
    let hexagonRadius = this.contentHeight / 10;

    let totalWidth =  Math.floor(6 * (Math.sqrt(3) * hexagonRadius));

    this.realSize = totalWidth;
    let totalHeight = this.contentHeight;

    if(this.leftSidebarOpen && this.rightSidebarOpen) {
      this.leftSidebarWidth = Math.floor((this.contentWidth - totalWidth) * 0.35);
      this.rightSidebarWidth = this.contentWidth - totalWidth - this.leftSidebarWidth;
    } else if(this.leftSidebarOpen) {
      this.leftSidebarWidth = Math.floor((this.contentWidth - totalWidth) * 0.35);
      this.rightSidebarWidth = 0;

      totalWidth = this.contentWidth - this.leftSidebarWidth;
    } else if(this.rightSidebarOpen) {
      this.rightSidebarWidth = Math.floor((this.contentWidth - totalWidth) * 0.65);
      this.leftSidebarWidth = 0;

      totalWidth = this.contentWidth - this.rightSidebarWidth;
    } else {
      this.leftSidebarWidth = 0;
      this.rightSidebarWidth = 0;

      totalWidth = this.contentWidth;
    }

    let borderSize = 12;
    let contentWidth = totalWidth - 2 * borderSize;
    let contentHeight = totalHeight - 2 * borderSize;

    // console.log(totalWidth, contentWidth, contentHeight);

    let container = document.getElementById("board-canvas-container");
    container.style.borderWidth = borderSize + "px";
    container.style.width = contentWidth + "px";
    container.style.height = contentHeight + "px";
  }

  initialize_board_canvas() {
    let parentContainer = document.getElementById("board-canvas-container");
    let width =  parentContainer.clientWidth;
    let height = parentContainer.clientHeight;

    let canvas = document.getElementById("constant-canvas");
    canvas.width = width;
    canvas.height = height;

    let canvas2 = document.getElementById("variable-canvas");
    canvas2.width = width;
    canvas2.height = height;
  }

  initialize_left_sidebar() {
    if(this.leftSidebarOpen) {
      this.initialize_left_sidebar_container();
      this.initialize_player_info_containers();
    } else {
      // this.initialize_left_sidebar_container();
      // this.initialize_player_info_containers();
      let container = document.getElementById("left-sidebar-container");
      container.style.display = "none";
    }
  }

  initialize_left_sidebar_container() {
    let totalWidth = this.leftSidebarWidth;
    let totalHeight = this.contentHeight;

    let borderSize = this.largeBorderSize;
    // if(this.leftSidebarOpen) {
    //   var borderSize = this.mediumBorderSize;
    // } else {
    //   var borderSize = 0;
    // }

    let contentWidth = totalWidth - borderSize;
    let contentHeight = totalHeight - 2 * borderSize;

    let container = document.getElementById("left-sidebar-container");
    container.style.display = "";


    container.style.width = contentWidth + "px";
    container.style.height = contentHeight + "px";
  }

  initialize_player_info_containers() {
    let parentContainer = document.getElementById("left-sidebar-container");
    let totalWidth = parentContainer.clientWidth;
    let totalHeight = parentContainer.clientHeight * 0.25;

    let marginSize = this.contentWidth * 0.00625;
    let borderSize = this.mediumBorderSize
    let contentWidth = totalWidth - 2 * marginSize -  2 * borderSize;
    let contentHeight = totalHeight - 2 * marginSize + 0.25 * (3 * marginSize) - 2 * borderSize;

    let containers = document.getElementsByClassName("player-info-container");
    for(let i = 0; i < containers.length; ++i) {
      let container = containers[i];
      container.style.margin = marginSize + "px";
      container.style.width = contentWidth + "px";
      container.style.height = contentHeight + "px";

      if(i !== 3) {
        container.style.marginBottom = "0px";
      }
    }
  }

  initialize_right_sidebar() {
    if(this.rightSidebarOpen) {
      this.initialize_right_sidebar_container();
      this.initialize_chat_box();
      this.initialize_action_container();
      this.initialize_icon_container();
      // this.initialize_building_button_container();
    } else {
      let canvasContainer = document.getElementById("board-canvas-container");
      let sidebar = document.getElementById("right-sidebar-container");
      sidebar.style.display = "none";
    }
  }

  initialize_right_sidebar_container() {
    let totalWidth = this.rightSidebarWidth;
    let totalHeight = this.contentHeight;

    let borderSize = this.largeBorderSize;
    let contentWidth = totalWidth - borderSize;
    let contentHeight = totalHeight - 2 * borderSize;

    let container = document.getElementById("right-sidebar-container");
    container.style.display = "";
    container.style.width = contentWidth + "px";
    container.style.height = contentHeight + "px";
  }

  initialize_chat_box() {
    let parentContainer = document.getElementById("right-sidebar-container");
    let totalWidth = parentContainer.clientWidth;
    let totalHeight = parentContainer.clientHeight * 0.4;

    let borderSize = this.largeBorderSize
    let contentWidth = totalWidth;
    let contentHeight = totalHeight - borderSize;

    let container = document.getElementById("chat-box");
    // container.style.borderWidth = borderSize + "px";
    container.style.width = contentWidth + "px";
    container.style.height = contentHeight + "px";
  }

  initialize_action_container() {
    let parentContainer = document.getElementById("right-sidebar-container");
    let totalWidth = parentContainer.clientWidth;
    let totalHeight = parentContainer.clientHeight * 0.6;
    let marginSize = this.contentWidth * 0.00625;
    let borderSize = Math.ceil(this.contentWidth * 0.0015);
    let contentWidth = totalWidth - 2 * marginSize -  2 * borderSize;
    let contentHeight = totalHeight - 2 * marginSize - 2 * borderSize;

    let container = document.getElementById("action-container");
    container.style.margin = marginSize + "px";
    container.style.borderWidth = borderSize + "px";
    container.style.width = contentWidth + "px";
    container.style.height = contentHeight + "px";
  }

  initialize_left_sidebar_button() {

    let leftSidebar = document.getElementById("left-sidebar-container");
    let canvasContainer = document.getElementById("board-canvas-container");


    let width = this.contentWidth * 0.03;
    let height = width;

    let button = document.getElementById("left-sidebar-button");
    if(this.leftSidebarOpen) {
      button.style.left = this.leftSidebarWidth + parseInt(canvasContainer.style.borderLeftWidth, 10) / 3 + "px";
    } else {
      button.style.left = parseInt(canvasContainer.style.borderLeftWidth, 10) / 3 + "px";
    }
    button.style.top = this.contentHeight / 2 - (height / 2);

    button.setAttribute("width", String(width / 2));
    button.setAttribute("height", String(height));

    let drawing = document.getElementById("left-sidebar-button-drawing");
    drawing.setAttribute("cx", 0);
    drawing.setAttribute("cy", height / 2);
    drawing.setAttribute("r", width / 2);
  }

  initialize_right_sidebar_button() {

    let rightSidebar = document.getElementById("right-sidebar-container");
    let canvasContainer = document.getElementById("board-canvas-container");

    let width = this.contentWidth * 0.03;
    let height = width;

    let button = document.getElementById("right-sidebar-button");
    if(this.rightSidebarOpen) {
      button.style.left = this.contentWidth - this.rightSidebarWidth - parseInt(canvasContainer.style.borderRightWidth, 10) / 3 - width / 2 + "px";
    } else {
      button.style.left = this.contentWidth - parseInt(canvasContainer.style.borderRightWidth, 10) / 3 - width / 2 + "px";
    }
    button.style.top = this.contentHeight / 2 - (height / 2);

    button.setAttribute("width", String(width / 2));
    button.setAttribute("height", String(height));

    let drawing = document.getElementById("right-sidebar-button-drawing");
    drawing.setAttribute("cx", width / 2);
    drawing.setAttribute("cy", height / 2);
    drawing.setAttribute("r", width / 2);
  }
}
