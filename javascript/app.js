// Generated by CoffeeScript 1.6.1
(function() {
  var $, Splitter, autogrow, buffer, fs, gui, handlebars, jonoeditor, marked, modal, ncp, path, rangyinputs, util,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  global.document = document;

  gui = global.gui = require('nw.gui');

  fs = require('fs');

  buffer = require('buffer');

  path = require('path');

  ncp = require('ncp').ncp;

  util = require('util');

  global.jQuery = $ = require('jQuery');

  handlebars = require('handlebars');

  marked = require('marked');

  Splitter = require('./javascript/lib/splitter');

  modal = require('./javascript/lib/modal');

  autogrow = require('./javascript/lib/autogrow');

  rangyinputs = require('./javascript/lib/rangyinputs');

  jonoeditor = (function() {

    function jonoeditor(el) {
      this.el = el;
      this.el.prop("disabled", false);
      this.el.html("<textarea></textarea>");
      this.el.find("textarea").autogrow();
    }

    jonoeditor.prototype.getReadOnly = function() {
      return this.el.prop("disabled");
    };

    jonoeditor.prototype.setReadOnly = function(bool) {
      return this.el.prop("disabled", bool);
    };

    jonoeditor.prototype.getValue = function() {
      return this.el.find("textarea").val();
    };

    jonoeditor.prototype.setValue = function(value) {
      return this.el.find("textarea").val(value);
    };

    jonoeditor.prototype.hide = function() {
      return this.el.hide();
    };

    jonoeditor.prototype.show = function() {
      return this.el.show();
    };

    return jonoeditor;

  })();

  window.noted = {
    currentList: "all",
    currentNote: "",
    init: function() {
      window.noted.homedir = process.env.HOME;
      window.noted.resvchar = [186, 191, 220, 222, 106, 56];
      window.noted.storagedir = window.noted.osdirs();
      return window.noted.initUI();
    },
    initUI: function() {
      Splitter.init({
        parent: $('#parent')[0],
        panels: {
          left: {
            el: $("#notebooks")[0],
            min: 150,
            width: 200,
            max: 450
          },
          center: {
            el: $("#notes")[0],
            min: 250,
            width: 300,
            max: 850
          },
          right: {
            el: $("#content")[0],
            min: 450,
            width: 550,
            max: Infinity
          }
        }
      });
      window.noted.window = gui.Window.get();
      window.noted.window.show();
      window.noted.window.showDevTools();
      window.noted.load.notebooks();
      window.noted.load.notes("All Notes");
      window.noted.editor = new jonoeditor($("#contentwrite"));
      $('.modal.settings .false').click(function() {
        return $('.modal.settings').modal("hide");
      });
      $('#panel').mouseenter(function() {
        return $('#panel').addClass('drag');
      }).mouseleave(function() {
        return $('#panel').removeClass('drag');
      });
      $('#panel #decor img, #panel #noteControls img, #panel #search').mouseenter(function() {
        return $('#panel').removeClass('drag');
      }).mouseleave(function() {
        return $('#panel').addClass('drag');
      });
      $('#noteControls img').click(function() {
        return window.noted.UIEvents.clickNoteControls($(this).attr("id"));
      });
      $(".modal.delete .true").click(function() {
        return window.noted.UIEvents.modalclickDel();
      });
      $(".modal.delete .false").click(function() {
        return $(".modal.delete").modal("hide");
      });
      $(".modal.deleteNotebook .true").click(function() {
        return window.noted.UIEvents.modalclickDelNotebook();
      });
      $(".modal.renameNotebook .true").click(function() {
        return window.noted.UIEvents.modalclickRenameNotebook();
      });
      $(".modal.deleteNotebook .false").click(function() {
        return $(".modal.deleteNotebook").modal("hide");
      });
      $(".modal.renameNotebook .false").click(function() {
        return $(".modal.renameNotebook").modal("hide");
      });
      $('#close').click(function() {
        return window.noted.UIEvents.titlebarClose();
      });
      $('#minimize').click(function() {
        return window.noted.UIEvents.titlebarMinimize();
      });
      $('#maximize').click(function() {
        return window.noted.UIEvents.titlebarMaximize();
      });
      $('body').on("keydown", "#notebooks input", function(e) {
        return window.noted.UIEvents.keydownNotebook(e);
      });
      $('body').on("click contextmenu", "#notebooks li", function() {
        return window.noted.UIEvents.clickNotebook($(this));
      });
      $('body').on("contextmenu", "#notebooks li", function(e) {
        window.noted.UIEvents.contextNotebook(e, $(this));
        return false;
      });
      $('body').on("click contextmenu", ".popover-mask", function() {
        return $(this).hide().children().hide();
      });
      $("body").on("keydown", ".headerwrap .left h1", function(e) {
        return window.noted.UIEvents.keydownTitle(e, $(this));
      });
      $("body").on("keyup", ".headerwrap .left h1", function() {
        return window.noted.UIEvents.keyupTitle($(this));
      });
      $('body').on("click", "#notes li", function() {
        return window.noted.UIEvents.clickNote($(this));
      });
      $('body').on("click", "#deleteNotebook", function() {
        return window.noted.UIEvents.deleteNotebook($(this));
      });
      $('body').on("click", "#renameNotebook", function() {
        return window.noted.UIEvents.renameNotebook();
      });
      $("#content .edit").click(window.noted.editMode);
      return $("body").on("click", ".editorbuttons button", function() {
        return window.noted.editorAction($(this).attr('data-action'));
      });
    },
    rename: function(oldfile, newfile) {
      var r;
      while (fs.existsSync(path.join(window.noted.storagedir, "Notebooks", newfile + '.txt'))) {
        r = /\(\s*(\d+)\s*\)$/;
        if (r.exec(newfile) === null) {
          newfile = newfile + " (1)";
        } else {
          newfile = newfile.replace(" (" + r.exec(newfile)[1] + ")", " (" + (parseInt(r.exec(newfile)[1]) + 1) + ")");
        }
      }
      fs.rename(path.join(window.noted.storagedir, "Notebooks", oldfile + '.txt'), path.join(window.noted.storagedir, "Notebooks", newfile + '.txt'));
      return path.join(window.noted.storagedir, "Notebooks", newfile + '.txt');
    },
    renameNotebook: function(oldfile, newfile) {
      var r;
      while (fs.existsSync(path.join(window.noted.storagedir, "Notebooks", newfile))) {
        r = /\(\s*(\d+)\s*\)$/;
        if (r.exec(newfile) === null) {
          newfile = newfile + " (1)";
        } else {
          newfile = newfile.replace(" (" + r.exec(newfile)[1] + ")", " (" + (parseInt(r.exec(newfile)[1]) + 1) + ")");
        }
      }
      fs.rename(path.join(window.noted.storagedir, "Notebooks", oldfile), path.join(window.noted.storagedir, "Notebooks", newfile));
      return path.join(window.noted.storagedir, "Notebooks", newfile);
    },
    editorAction: function(action) {
      if (action === 'bold') {
        return $('#contentwrite textarea').surroundSelectedText("**", "**");
      } else if (action === 'italics') {
        return $('#contentwrite textarea').surroundSelectedText("*", "*");
      }
    },
    deselect: function() {
      $("#content").addClass("deselected");
      return window.noted.currentNote = "";
    },
    editMode: function(mode) {
      var el;
      el = $("#content .edit");
      if (mode === "preview" || window.noted.editor.getReadOnly() === false && mode !== "editor") {
        el.removeClass("save").text("edit");
        $('#content .left h1').attr('contenteditable', 'false');
        $("#content .right time").show();
        $("#contentread").html(marked(window.noted.editor.getValue())).show();
        $("#content .editorbuttons").removeClass("show");
        window.noted.editor.hide();
        window.noted.editor.setReadOnly(true);
        return window.noted.save();
      } else {
        el.addClass("save").text("save");
        $('.headerwrap .left h1').attr('contenteditable', 'true');
        $("#content .right time").hide();
        $("#contentread").hide();
        $("#content .editorbuttons").addClass("show");
        window.noted.editor.show();
        window.noted.editor.setReadOnly(false);
        return $(window).trigger("resize");
      }
    },
    save: function() {
      var list, notePath;
      list = $("#notes li[data-id='" + window.noted.currentNote + "']").attr("data-list");
      if (window.noted.currentNote !== "") {
        notePath = path.join(window.noted.storagedir, "Notebooks", list, window.noted.currentNote + '.txt');
        return fs.writeFile(notePath, window.noted.editor.getValue());
      }
    },
    load: {
      notebooks: function() {
        var htmlstr, template;
        template = handlebars.compile($("#notebook-template").html());
        htmlstr = template({
          name: "All Notes",
          "class": "all"
        });
        return fs.readdir(path.join(window.noted.storagedir, "Notebooks"), function(err, data) {
          var i;
          i = 0;
          while (i < data.length) {
            if (fs.statSync(path.join(window.noted.storagedir, "Notebooks", data[i])).isDirectory()) {
              htmlstr += template({
                name: data[i]
              });
            }
            i++;
          }
          $("#notebooks ul").html(htmlstr);
          return $("#notebooks [data-id='" + window.noted.currentList + "'], #notebooks ." + window.noted.currentList).trigger("click");
        });
      },
      notes: function(list, type, callback) {
        var data, fd, htmlstr, i, info, lastIndex, name, note, num, order, template, time, _i, _len;
        window.noted.currentList = list;
        template = handlebars.compile($("#note-template").html());
        htmlstr = "";
        if (list === "All Notes") {
          htmlstr = "I broke all notes because of the shitty implementation";
        } else {
          data = fs.readdirSync(path.join(window.noted.storagedir, "Notebooks", list));
          order = [];
          i = 0;
          while (i < data.length) {
            if (data[i].substr(data[i].length - 4, data[i].length) === ".txt") {
              name = data[i].substr(0, data[i].length - 4);
              time = new Date(fs.statSync(path.join(window.noted.storagedir, "Notebooks", list, name + '.txt'))['mtime']);
              fd = fs.openSync(path.join(window.noted.storagedir, "Notebooks", list, name + '.txt'), 'r');
              buffer = new Buffer(100);
              num = fs.readSync(fd, buffer, 0, 100, 0);
              info = $(marked(buffer.toString("utf-8", 0, num))).text();
              fs.close(fd);
              if (info.length > 90) {
                lastIndex = info.lastIndexOf(" ");
                info = info.substring(0, lastIndex) + "&hellip;";
              }
              order.push({
                id: i,
                time: time,
                name: name,
                info: info
              });
            }
            i++;
          }
          order.sort(function(a, b) {
            return new Date(a.time) - new Date(b.time);
          });
          for (_i = 0, _len = order.length; _i < _len; _i++) {
            note = order[_i];
            htmlstr = template({
              name: note.name,
              list: list,
              date: window.noted.util.date(note.time),
              excerpt: note.info
            }) + htmlstr;
          }
        }
        $("#notes ul").html(htmlstr);
        if (callback) {
          return callback();
        }
      },
      note: function(selector) {
        window.noted.currentNote = $(selector).find("h2").text();
        return fs.readFile(path.join(window.noted.storagedir, "Notebooks", $(selector).attr("data-list"), window.noted.currentNote + '.txt'), 'utf-8', function(err, data) {
          var noteTime, time;
          if (err) {
            throw err;
          }
          $("#content").removeClass("deselected");
          $('.headerwrap .left h1').text(window.noted.currentNote);
          noteTime = fs.statSync(path.join(window.noted.storagedir, "Notebooks", $(selector).attr("data-list"), window.noted.currentNote + '.txt'))['mtime'];
          time = new Date(Date.parse(noteTime));
          $('.headerwrap .right time').text(window.noted.util.date(time) + " " + window.noted.util.pad(time.getHours()) + ":" + window.noted.util.pad(time.getMinutes()));
          $("#contentread").html(marked(data)).show();
          window.noted.editor.setValue(data);
          window.noted.editor.setReadOnly(true);
          if (selector.hasClass("edit")) {
            window.noted.editMode("editor");
            $("#content .left h1").focus();
            return selector.removeClass("edit");
          } else {
            return window.noted.editMode("preview");
          }
        });
      }
    },
    osdirs: function() {
      if (process.platform === 'darwin') {
        return path.join(window.noted.homedir, "/Library/Application Support/Noted/");
      } else if (process.platform === 'win32') {
        return path.join(process.env.LOCALAPPDATA, "/Noted/");
      } else if (process.platform === 'linux') {
        return path.join(window.noted.homedir, '/.config/Noted/');
      }
    },
    UIEvents: {
      clickNoteControls: function(id) {
        var mailto, name, r;
        if (id === "new" && window.noted.currentList !== "All Notes" && window.noted.editor.getReadOnly() === true) {
          name = "Untitled Note";
          while (fs.existsSync(path.join(window.noted.storagedir, "Notebooks", window.noted.currentList, name + ".txt"))) {
            r = /\(\s*(\d+)\s*\)$/;
            if (r.exec(name) === null) {
              name = name + " (1)";
            } else {
              name = name.replace(" (" + r.exec(name)[1] + ")", " (" + (parseInt(r.exec(name)[1]) + 1) + ")");
            }
          }
          return fs.writeFile(path.join(window.noted.storagedir, "Notebooks", window.noted.currentList, name + '.txt'), "This is your new blank note\n====\nAdd some content!", function() {
            return window.noted.load.notes(window.noted.currentList, "", function() {
              return $("#notes ul li:first").addClass("edit").trigger("click");
            });
          });
        } else if (!$("#noteControls").hasClass("disabled")) {
          if (id === "share") {
            $(".popover-mask").show();
            $(".share-popover").css({
              left: ($(event.target).offset().left) - 3,
              top: "28px"
            }).show();
            mailto = "mailto:?subject=" + encodeURI(window.noted.currentNote) + "&body=" + encodeURI(window.noted.editor.getValue());
            return $("#emailNote").parent().attr("href", mailto);
          } else if (id === "del") {
            return $('.modal.delete').modal();
          }
        }
      },
      modalclickDel: function() {
        $('.modal.delete').modal("hide");
        if (window.noted.currentNote !== "") {
          return fs.unlink(path.join(window.noted.storagedir, "Notebooks", $("#notes li[data-id='" + window.noted.currentNote + "']").attr("data-list"), window.noted.currentNote + '.txt'), function(err) {
            if (err) {
              throw err;
            }
            window.noted.deselect();
            return window.noted.load.notes(window.noted.currentList);
          });
        }
      },
      titlebarClose: function() {
        return window.noted.window.close();
      },
      titlebarMinimize: function() {
        return window.noted.window.minimize();
      },
      titlebarMaximize: function() {
        return window.noted.window.maximize();
      },
      keydownNotebook: function(e) {
        var name, regexp;
        name = $('#notebooks input').val();
        if (e.keyCode === 13) {
          e.preventDefault();
          while (fs.existsSync(path.join(window.noted.storagedir, "Notebooks", window.noted.currentList, name + '.txt')) === true) {
            regexp = /\(\s*(\d+)\s*\)$/;
            if (regexp.exec(name) === null) {
              name = name + " (1)";
            } else {
              name = name.replace(" (" + regexp.exec(name)[1] + ")", " (" + (parseInt(regexp.exec(name)[1]) + 1) + ")");
            }
          }
          fs.mkdir(path.join(window.noted.storagedir, "Notebooks", name));
          window.noted.load.notebooks();
          return $('#notebooks input').val("").blur();
        }
      },
      clickNotebook: function(element) {
        $("#noteControls").addClass("disabled");
        element.parent().find(".selected").removeClass("selected");
        element.addClass("selected");
        window.noted.load.notes(element.text());
        return window.noted.deselect();
      },
      contextNotebook: function(event, element) {
        $(".popover-mask").show();
        $(".popover-mask").attr("data-parent", element.text());
        console.log(element.text());
        return $(".delete-popover").css({
          left: $(event.target).outerWidth(),
          top: $(event.target).offset().top
        }).show();
      },
      keydownTitle: function(e, element) {
        var name, _ref;
        if (e.keyCode === 13 && element.text() !== "") {
          e.preventDefault();
          name = element.text();
          window.noted.rename(window.noted.currentList + '/' + window.noted.currentNote, window.noted.currentList + '/' + name);
          window.noted.currentNote = name;
          window.noted.load.notes(window.noted.currentList);
          return element.blur();
        } else if (_ref = e.keyCode, __indexOf.call(window.noted.resvchar, _ref) >= 0) {
          return e.preventDefault();
        }
      },
      keyupTitle: function(element) {
        var name;
        name = element.text();
        if (name !== "") {
          $("#notes [data-id='" + window.noted.currentNote + "']").attr("data-id", name).find("h2").text(element.text());
          path.join(window.noted.storagedir, "Notebooks", window.noted.currentList, window.noted.currentNote + '.txt');
          path.join(window.noted.storagedir, "Notebooks", window.noted.currentList, name + '.txt');
          fs.rename(path.join(window.noted.storagedir, "Notebooks", window.noted.currentList, window.noted.currentNote + '.txt'), path.join(window.noted.storagedir, "Notebooks", window.noted.currentList, name + '.txt'));
          return window.noted.currentNote = name;
        }
      },
      clickNote: function(element) {
        $("#noteControls").removeClass("disabled");
        $("#notes .selected").removeClass("selected");
        element.addClass("selected");
        return window.noted.load.note(element);
      },
      deleteNotebook: function(element) {
        return $('.modal.deleteNotebook').modal();
      },
      renameNotebook: function() {
        var name;
        name = $(".popover-mask").attr("data-parent");
        $('.modal.renameNotebook').modal();
        return $('.modal.renameNotebook input').val(name).focus();
      },
      modalclickDelNotebook: function() {
        var name;
        $('.modal.deleteNotebook').modal("hide");
        name = $(".popover-mask").attr("data-parent");
        console.log(name);
        return fs.readdir(path.join(window.noted.storagedir, "Notebooks", name), function(err, files) {
          return files.forEach(function(file) {
            console.log(file);
            fs.unlink(path.join(window.noted.storagedir, "Notebooks", name, file));
            return fs.rmdir(path.join(window.noted.storagedir, "Notebooks", name), function(err) {
              window.noted.deselect();
              return window.noted.load.notebooks();
            });
          });
        });
      },
      modalclickRenameNotebook: function() {
        var name, origname;
        $('.modal.renameNotebook').modal("hide");
        origname = $(".popover-mask").attr("data-parent");
        name = $('.modal.renameNotebook input').val();
        if (name !== "") {
          window.noted.renameNotebook(origname, name);
          return window.noted.load.notebooks();
        }
      }
    },
    util: {
      date: function(date) {
        var difference, month, now, oneDay, words;
        date = new Date(date);
        month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        now = new Date();
        difference = 0;
        oneDay = 86400000;
        words = '';
        difference = Math.ceil((date.getTime() - now.getTime()) / oneDay);
        console.log(difference);
        if (difference === 0) {
          words = "Today";
        } else if (difference === -1) {
          words = "Yesterday";
        } else if (difference > 0) {
          words = "In " + difference + " days";
        } else if (difference > -15) {
          words = Math.abs(difference) + " days ago";
        } else if (difference > -365) {
          words = month[date.getMonth()] + " " + date.getDate();
        } else {
          words = window.noted.util.pad(date.getFullYear()) + "-" + (window.noted.util.pad(date.getMonth() + 1)) + "-" + window.noted.util.pad(date.getDate());
        }
        return words;
      },
      pad: function(n) {
        if (n < 10) {
          return "0" + n;
        } else {
          return n;
        }
      }
    }
  };

  window.noted.init();

}).call(this);
