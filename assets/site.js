import $ from 'jquery'
// import 'jquery.initialize'
// import 'jquery-ui-bundle'
import 'bootstrap'
// import 'clipboard'
// import moment from 'moment'
// import Chart from 'chart.js'
// import timeago from 'timeago'
// import u2f from './u2f-api'

import './site.scss'

// $(window).ready(function() {
//   $('#sidebar .nav-link').each(function() {
//     var link = $(this);
//     if (window.location.pathname.startsWith($(this).attr('href'))) {
//       $(this).addClass('active');
//     }
//   });

//   $('main').on('click', '[data-toggle="collapse.lazy"]', function() {
//     stop_reloader();
//     toggle_collapse_lazy(this);
//   });

//   $('main').on('click', '[data-toggle="modal.lazy"]', function() {
//     stop_reloader();
//     toggle_modal_lazy(this);
//   });

//   var collapse_showing = false;
//   var modal_showing = false;

//   $('main').on('show.bs.collapse', '.collapse', function() {
//     collapse_showing = true;
//   });

//   $('main').on('shown.bs.collapse', '.collapse', function() {
//     push_state_add(this);
//     collapse_showing = false;
//   });

//   $('main').on('show.bs.modal', '.modal', function() {
//     modal_showing = true;
//   });

//   $('main').on('shown.bs.modal', '.modal', function() {
//     push_state_add(this);
//     modal_showing = false;
//   });

//   $('main').on('hide.bs.collapse', '.collapse', function() {
//     if (!collapse_showing) push_state_remove(this);
//   });

//   $('main').on('hide.bs.modal', '.modal', function() {
//     if (!modal_showing) push_state_remove(this);
//   });

//   $('main').on('show.bs.collapse', '.collapse', function() {
//     $(this).data('expanded', 'true');
//   });

//   $('main').on('hide.bs.collapse', '.collapse', function() {
//     $(this).data('expanded', 'false');
//   });

//   $('main').on('show.bs.modal', '.modal', function() {
//     $(this).data('expanded', 'true');
//   });

//   $('main').on('show.bs.modal', '.modal', function() {
//     $(this).data('expanded', 'false');
//   });

//   $('main').on('hidden.bs.modal', '.modal.lazy', function() {
//     $(this).html('');
//   });

//   $('main').on('show.bs.modal', '.integration-settings-modal', function(e) {
//     var button = $(e.relatedTarget);
//     $(this).find('h5 .fa').removeClass().addClass('fa').addClass('fab').addClass('fa-' + button.data('icon'));
//     $(this).find('.title').text(button.data('title'));
//   });

//   $('#organization-create').on('shown.bs.modal', function() {
//     $('#organization-create #name').focus();
//   });

//   $('#welcome input:text:visible:first').focus();

//   $('.organization-setting .on').click(function(e) {
//     var setting = $(e.target).parents('.organization-setting');
//     var oid = $(setting).data('oid');

//     $(setting).find('.off').removeClass('btn-danger').addClass('btn-secondary');
//     $(setting).find('.on').removeClass('btn-secondary').addClass('btn-success');

//     $(setting).find('select').prop('disabled', false);

//     organization_setting_save(oid, setting, $(setting).find('select').val() || 'on');
//   });

//   $('.organization-setting .off').click(function(e) {
//     var setting = $(e.target).parents('.organization-setting');
//     var oid = $(setting).data('oid');

//     $(setting).find('.off').removeClass('btn-secondary').addClass('btn-danger');
//     $(setting).find('.on').removeClass('btn-success').addClass('btn-secondary');

//     $(setting).find('select').prop('disabled', true);

//     organization_setting_save(oid, setting, 'off');
//   });

//   $('.organization-setting select').change(function(e) {
//     var setting = $(e.target).parents('.organization-setting');

//     saveSetting(setting, $(setting).find('select').val());
//   });

//   $('.rack-contents').on('show.bs.collapse', function() {
//     var rack = $(this).data('rack');
//     window.setTimeout(function() {
//       $('#racks li.rack .buttons button').stop().fadeOut();
//     }, 50);
//   });

//   $('.rack-contents').on('hide.bs.collapse', function() {
//     $('#racks li.rack .buttons button').stop().fadeIn();
//   });

//   $('main').on('shown.bs.modal', '.modal:not(.nofocus)', function() {
//     $(this).find('input:text:visible:first').focus();
//   });

//   $('main').on('shown.bs.modal', '.modal.lazy:not(.nofocus)', function() {
//     $(this).find('input:text:visible:first').focus();
//   });

//   $('main').on('click', '.app-delete', function(e) {
//     $($(this).data('target')).modal('show');
//     e.stopPropagation();
//   });

//   $('main').on('click', '.rack-remove', function(e) {
//     $($(this).data('target')).modal('show');
//     e.stopPropagation();
//   });

//   $('main').on('click', '.rack-settings', function(e) {
//     toggle_modal_lazy(this);
//     e.stopPropagation();
//   });

//   $('main').on('click', '#workflow-add-task', function() {
//     $('#workflow-tasks').append($('#workflow-task-template').html());
//   });

//   $.initialize('select.repositories', function() {
//     var blank = '<option selected disabled hidden style="display:none" value=""></option>';
//     var select = $(this);
//     select.html(select.find('optgroup').sort(function(a, b) {
//       return $(a).text() < $(b).text() ? -1 : 1
//     }));
//     select.prepend(blank);
//     select.find('optgroup').each(function() {
//       var optgroup = $(this);
//       optgroup.html(optgroup.find('option').sort(function(a, b) {
//         return $(a).text() < $(b).text() ? -1 : 1
//       }));
//     });
//     //select.get(0).selectedIndex = 0;
//   });

//   $.initialize('time.relative', function() {
//     $(this).timeago();
//   });

//   $.initialize('[data-toggle="tooltip"]', function() {
//     $(this).tooltip();
//   });

//   $.initialize('.rack-import', function() {
//     var modal = $(this);
//     var oid = $(modal).data('organization');
//     var integration = $(modal).data('integration');

//     $(modal).find('select#region').on('change', function() {
//       var region = $(this).val();
//       var rack = $(modal).find('select#rack');
//       var name_select = $(modal).find('input#name');
//       var submit = $(modal).find('#import-submit');

//       $.get(`/organizations/${oid}/integrations/${integration}/racks/${region}`).done(function(res) {
//         $(rack).prop('disabled', true);
//         $(rack).find('option').remove();

//         $(name_select).prop('disabled', true);
//         $(name_select).val('');

//         $(submit).prop('disabled', true);

//         if (Object.keys(res).length == 0) {
//           return
//         }

//         $(rack).append('<option selected disabled hidden style="display: none" value="">Select a Rack...</option>');

//         for (var name in res) {
//           $(rack).append(`<option value="${name}">${name}</option>`)
//         }

//         $(rack).prop('disabled', false);
//         $(submit).prop('disabled', false);
//       });
//     });

//     $(modal).find('select#rack').on('change', function() {
//       var name = $(this).find('option:selected').text();

//       $(modal).find('input#name').prop('disabled', false);
//       $(modal).find('input#name').val(name);
//     });
//   });


//   $('main').on('shown.bs.modal', '.modal', stop_reloader);
//   $('main').on('hide.bs.modal', '.modal', restart_reloader);
//   $('main').on('shown.bs.dropdown', '.dropdown', stop_reloader);
//   $('main').on('hide.bs.dropdown', '.dropdown', restart_reloader);

//   var scrollMonitorTop = 0;
//   var scrollMonitorEnd = true;

//   $.initialize('.scroll-monitor', function() {
//     var monitor = $(this);
//     if (scrollMonitorEnd) {
//       monitor.prop('scrollTop', monitor.prop('scrollHeight'));
//     } else {
//       monitor.prop('scrollTop', scrollMonitorTop);
//     }
//     monitor.on('scroll', function() {
//       scrollMonitorTop = $(this).prop('scrollTop');
//       scrollMonitorEnd = ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight);
//       console.log('scrollMonitorTop', scrollMonitorTop);
//       console.log('scrollMonitorEnd', scrollMonitorEnd);
//     })
//   });

//   function extend_bottom() {
//     $(this).css('max-height', $(window).height() - $(this).offset().top - 24);
//   }

//   $.initialize('.extend-bottom', extend_bottom);

//   $(window).on('resize', function() {
//     $('.extend-bottom').each(extend_bottom);
//   });
// });

// function account_key_reset(host) {
//   $.post('/account/key/reset').done(function(key) {
//     $('#key-reset #cli-key').val(`convox login ${host} -p ${key}`);
//     $('#key-reset').on('shown.bs.modal', function() {
//       $('#key-reset #cli-key').select();
//     });
//     $('#key-reset').modal('show');
//   })
// }

// function clipboard_copy(btn, selector) {
//   $(selector).select();
//   document.execCommand('copy');
//   $(btn).tooltip('show');
// }

// function deploy_key_create(oid, form) {
//   var input = $(form).find('#name')
//   var name = input.val();

//   $.post(`/organizations/${oid}/keys`, { 'name': name }).done(function(res) {
//     $('#key-create #key').val(res.key);
//     $('#key-create').on('shown.bs.modal', function() {
//       $('#key-create #key').select();
//     });
//     $('#key-create').on('hide.bs.modal', function() {
//       window.location.reload();
//     });
//     $('#key-create').modal('show');
//   })

//   return false;
// }

// function integration_aws_create() {
//   $.ajax({
//     async: false,
//     data: { kind:'runtime', provider:'aws' },
//     method: 'POST',
//     url: '/organizations/{{oid}}/integrations',
//   }).done(function(res) {
//     window.open(res.template, '_blank');
//     window.location.reload();
//   });
// }

// function organization_create() {
//   var name = $('#organization-create #name').val();

//   $.post('/organizations', {"name":name}).done(function(res) {
//     if (res.id != "") {
//       window.location.href = '/organizations/' + res.id;
//     } else {
//       $('#organization-create #alert #message').text('Error creating organization');
//       $('#organization-create #alert').show();
//     }
//   }).fail(function(res) {
//     switch (parseInt(res.status / 100)) {
//     case 4:
//       $('#organization-create #alert #message').text(res.responseText);
//       $('#organization-create #alert').show();
//       break;
//     default:
//       $('#organization-create #alert #message').text('Error creating organization');
//       $('#organization-create #alert').show();
//       break;
//     }
//   });
// }

// function organization_setting_save(oid, setting, value) {
//   $.post(`/organizations/${oid}/restrictions/` + $(setting).attr('id'), { 'value': value }).done(function() {
//     pulse(setting, '#c8f2c6');
//   }).fail(function() {
//     pulse(setting, '#fcd1d1');
//   })
// }

// function pulse(setting, color) {
//   var p = $(setting).parent();

//   $(p).animate({ 'background-color': color }, 300, function() {
//     $(p).animate({ 'background-color': '' }, 500);
//   });
// };

// function push_state_add(source) {
//   var anchor = $(source).data('anchor');
//   if (anchor !== undefined) {
//     history.pushState({}, '', `#${anchor}`);
//   }
// }

// function push_state_remove(source) {
//   if ($(source).data('anchor') !== undefined) {
//     if (window.location.hash.substring(1) != '') {
//       history.pushState({}, '', window.location.pathname);
//     }
//   }
// }

// function rack_install_advanced_add(runtime) {
//   var names = $(runtime).find('#parameter-select').find('select')[0].outerHTML;

//   $(runtime).find('#advanced-options').append(`
//     <div class="form-row advanced-option">
//       <div class="form-group col-6">
//         ${names}
//       </div>
//       <div class="form-group col-6">
//         <div class="d-flex">
//           <div class="flex-grow-1">
//             <input class="form-control" name="parameter-value" type="text">
//           </div>
//           <div class="flex-shrink-1">
//             <a class="btn btn-danger ml-2" href="#" onclick="javascript:$(this).parents('.advanced-option').remove();">
//               <i class="fa fa-remove"></i>
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   `);

//   $(runtime).find('#advanced-options').removeClass('collapse');
// }

// function reload() {
//   window.setTimeout(function() { window.location.reload(); }, 2000);
// }

// var reload_delay;
// var reload_reloader;
// var reload_request;
// var reload_ticker;

// function register_reloader(delay, container, url, cb) {
//   window.clearInterval(reload_ticker);

//   reload_reloader = function() {
//     reload_request = $.ajax((typeof url === 'function') ? url(container) : url).done(function(res) {
//       $(container).html(res);
//       if (typeof cb === 'function') cb(res);
//     }).fail(function(res) {
//       var loc = res.getResponseHeader('Location');
//       if (loc) window.location.replace(loc);
//     });
//   }

//   reload_delay = delay;
//   reload_ticker = window.setInterval(reload_reloader, reload_delay);
// }

// function restart_reloader() {
//   if (reload_reloader !== undefined) {
//     window.clearInterval(reload_ticker);
//     reload_ticker = window.setInterval(reload_reloader, reload_delay);
//   }
// }

// function stop_reloader() {
//   if (reload_request !== undefined) {
//     reload_request.abort();
//   }
//   window.clearInterval(reload_ticker);
// }

// function toggle_collapse_lazy(source) {
//   if ($(source).length == 0) return;

//   var target = $($(source).data('target'));
//   if ($(target).data('expanded') === 'true') {
//     $(target).collapse('hide');
//   } else {
//     $(target.data('loader')).show();
//     $(target.data('pulse')).addClass('pulse');
//     $(target.data('spinner')).addClass('fa-spin');
//     $(target).load($(target).data('url'), function() {
//       $(target.data('loader')).hide();
//       $(target.data('pulse')).removeClass('pulse');
//       $(target.data('spinner')).removeClass('fa-spin');
//       $(target).collapse('show');
//     });
//   }
// }

// function toggle_modal_lazy(source) {
//   if ($(source).length == 0) return;

//   var target = $($(source).data('target'));
//   if ($(target).data('expanded') == 'true') {
//     $(target).modal('hide');
//   } else {
//     $(target.data('loader')).show();
//     $(target.data('pulse')).addClass('pulse');
//     $(target.data('spinner')).addClass('fa-spin');
//     $(target).load($(target).data('url'), function(res, code) {
//       switch (code) {
//       case 'error':
//         $(target).html('<div class="modal-dialog"><div class="modal-content"><div class="modal-body bg-danger text-light">An error has occurred while loading this content<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div></div></div>');
//       default:
//         $(target.data('loader')).hide();
//         $(target.data('pulse')).removeClass('pulse');
//         $(target.data('spinner')).removeClass('fa-spin');
//         $(target).modal('show');
//       }
//     });
//   }
// }

// function token_auth_request() {
//   $.get('/token/authenticate', function(res) {
//     u2f.sign(res.appId, res.challenge, res.registeredKeys, token_auth_response, 30);
//   });
// }

// function token_auth_response(token) {
//   $.post('/token/authenticate', JSON.stringify(token)).done(function(res) {
//     if (res.location !== undefined) {
//       window.location.href = res.location
//     } else {
//       console.log('root');
//       window.location.href = '/';
//     }
//   }).fail(function() {
//     window.location.href = window.location.href;
//   });
// }

// function token_register_request() {
//   $.get('/account/tokens/register', function(req) {
//     u2f.register(req.appId, req.registerRequests, (req.registeredKeys || []), token_register_response, 30);
//     $('#token-register').modal('show');
//   });
// }

// function token_register_response(token) {
//   $('#token-register').modal('hide');
//   $.post('/account/tokens/register', JSON.stringify(token)).always(function() {
//     window.location.href = '/account'
//   })
// }

// window.$ = $
// window.account_key_reset = account_key_reset
// window.clipboard_copy = clipboard_copy
// window.deploy_key_create = deploy_key_create
// window.integration_aws_create = integration_aws_create
// window.moment = moment
// window.organization_create = organization_create
// window.push_state_add = push_state_add
// window.push_state_remove = push_state_remove
// window.rack_install_advanced_add = rack_install_advanced_add
// window.register_reloader = register_reloader
// window.reload = reload
// window.restart_reloader = restart_reloader
// window.stop_reloader = stop_reloader
// window.toggle_collapse_lazy = toggle_collapse_lazy
// window.toggle_modal_lazy = toggle_modal_lazy
// window.token_auth_request = token_auth_request
// window.token_register_request = token_register_request
