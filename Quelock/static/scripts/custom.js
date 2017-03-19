function notify(text){
    $('.notification').slideDown(1000).append("<span>"+text+"</span><a id='close' onclick='close_notify()'>[close]</a>");
}

function close_notify(){
    $('.notification').slideUp(500);
}

function is_user_logged_in(){
    if(is_loggedin.includes('False'))return false;
    else return true;
}

function get_exerpt_without_image(htmlCOntent){
    $('.hidden-').html(htmlCOntent);
    return $('.hidden-').text().substring(0, 100);
}

function convertdatetoword(value){
    var date = value.split("-");
    var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var new_date = date[2] + ' ' + month[parseInt(date[1]) - 1] + ', ' + date[0];
    return new_date
}

//Answers tab in profile
function check_logged_perm(value){
    if(user !=  'AnonymousUser' && user != value.writer.user.username){
        return "    "+check_if_answer_already_upvoted(value)+"\
                            "+check_if_answer_already_downvoted(value)+"\
                            &middot; <a class='comment-link comment' onclick='commentbtnclick(value.id)'> comment</a>\
                            &middot; <a href='#'> report</a>\
                            "+check_if_bookmarked(value)+"";
    }
    else{
        return "<span class='fa fa-chevron-up'></span>  "+value.no_of_upvotes+"<span style='margin-right: 10px;'></span>\
                        <span class='fa fa-chevron-down'></span>  "+value.no_of_downvotes+"<span style='margin-right: 10px;'></span>";
    }
};

function commentsAndVotesInfoLine(value){
    if(value.no_of_comments == 0 && value.no_of_upvotes == 0) return '';
    else if(value.no_of_upvotes != 0 || value.no_of_comments != 0) return "<small><a href='#'>"+value.no_of_upvotes+pluralize(value.no_of_upvotes, 'upvote')+"</a>  &middot; <a href='#'>" +value.no_of_comments+pluralize(value.no_of_comments, 'comment')+"</a></small>";
}

function pluralize(integer, string){
    if (integer > 1) return ' '+string+'s';
    else return ' '+string;
}

function answer(value){
    return "<div class='card answer-box-"+value.id+"' style='width: 100%; padding: 15px; background-color: #FFFFFF;'> \
                                <div class='answer-content'>\
                                <a href='/questions/"+value.question.slug+"'><span style='font-size: 14pt;'>"+value.question.title+"</span></a>\
                                <hr/>\
                                "+value.body+"\
                                </div>\
                                <p>\
                                 "+commentsAndVotesInfoLine(value)+"\
                                 </p>\
                                <p>\
                                "+check_logged_perm(value)+"\
                                </p>\
                            </div>"
}


var original_getanswers_page = '/answers/'+req_user+'/';
var nextAnswersPage = original_getanswers_page;

function loadAnswers(){
    $.ajax({
        url: nextAnswersPage,
        dataType: 'json',
        data: {'data': req_user, 'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            if(data.results.length == 0) $('.post').append('<h3>No Answers written yet</h3>');
            else{
                $.each(data.results, function(key, value){
                    $('.post').append(answer(value));
                    $('img').addClass('img-responsive');
                });
            }
            if(data.next!=null){
                $('.btn-load').show();
                nextAnswersPage = data.next;
                $('.loading-1').hide();
            }
            else{
                $('.loading-1').hide();
                $('.load-btn').hide();
            }

        },
        error: function(){
            console.log('Failed')
        }
    });
}

function check_if_bookmarked(value){
    var bool = false;
    $.ajax({
        url: '/answers/check_if_bookmarked/?answer='+value.id,
        type: 'POST',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function (data) {
            bool = data;
        },
        error: function(){
            //notify('An error occured')
        },
        async : false
    });

    if(bool == true){
        return "<button class='btn btn-primary btn-xs archive-"+value.id+"' style='float: right;' onclick='unBookmarkAnswer("+value.id+")'><span class='fa fa-bookmark'></span> archived</button>"
    }
    else{
        return "<button class='btn btn-primary btn-xs archive-"+value.id+"' style='float: right;' onclick='bookmarkAnswer("+value.id+")'><span class='fa fa-bookmark'></span> archive</button>"
    }
}

function check_if_answer_already_upvoted(value){
    var bool_ = false;

    $.ajax({
        url: '/answers/check_upvoted/?answer='+value.id,
        type: 'POST',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            bool_ = data;
        },
        error: function (error) {

        },
        async: false

    });
    if(bool_==false) {
        return "<button class='btn btn-default btn-xs upvote-"+value.id+"' onclick='upvote("+value.id+")'><span class='fa fa-chevron-up'></span>  upvote</button>";
    }
    else if(bool_ == true){
        $('.downvote-'+value.id).addClass('disabled');
        return "<button class='btn btn-default btn-xs upvote-"+value.id+"' onclick='r_upvote("+value.id+")'><span class='fa fa-chevron-up'></span> upvoted</button>";
    }
}


function check_if_answer_already_downvoted(value){
    var bool_ = false;

    $.ajax({
        url: '/answers/check_downvoted/?answer='+value.id,
        type: 'POST',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            bool_ = data;
        },
        error: function (error) {

        },
        async: false

    });
    if(bool_==false) {
        return "<a class='dwnv downvote-"+value.id+"' onclick='downvote("+value.id+")'><span class='fa fa-chevron-down'></span>  downvote </a>";
    }
    else if(bool_ == true){
        $('.upvote-'+value.id).addClass('disabled');
        return "<a class='dwnv downvote-"+value.id+"' onclick='r_downvote("+value.id+")'><span class='fa fa-chevron-down'></span> downvoted</a>";
    }
}
//END OF INFO FOR ANSWER TAB


function upvote(answer_id) {
    $.post('/answers/upvote/?answer=' + answer_id + '&action=upvote', {
        'action': 'upvote',
        'csrfmiddlewaretoken': csrftoken
    }, function (data) {
        if (data == true) {
            $('.upvote-' + answer_id).html("<span class='fa fa-chevron-down'></span> Upvoted").attr('onclick', 'r_upvote(' + answer_id + ')')
            $('.downvote-' + answer_id).attr('disabled', 'true');
        }
    });
}

function r_upvote(answer_id) {
    $.post('/answers/upvote/?answer=' + answer_id + '&action=r_upvote', {
        'action': 'r_upvote',
        'csrfmiddlewaretoken': csrftoken
    }, function (data) {
        if (data == true) {
            $('.upvote-' + answer_id).html("<span class='fa fa-chevron-up'></span> Upvote").attr('onclick', 'upvote(' + answer_id + ')')
            $('.downvote-' + answer_id).removeAttr('disabled');
        }
    });
}

function downvote(answer_id) {
    $.post('/answers/downvote/?answer=' + answer_id + '&action=downvote', {'csrfmiddlewaretoken': csrftoken}, function (data) {
        if (data == true) {
            $('.downvote-' + answer_id).html('Downvoted').attr('onclick', 'r_downvote(' + answer_id + ')')
            $('.upvote-' + answer_id).attr('disabled', 'true');
        }
    });
}

function r_downvote(answer_id) {
    $.post('/answers/downvote/?answer=' + answer_id + '&action=r_downvote', {'csrfmiddlewaretoken': csrftoken}, function (data) {
        if (data == true) {
            $('.downvote-' + answer_id).html('Downvote').attr('onclick', 'downvote(' + answer_id + ')')
            $('.upvote-' + answer_id).removeAttr('disabled');
        }
    });
}

function bookmarkAnswer(answer_id) {
    $.ajax({
        url: '/answers/bookmark_answer/?answer=' + answer_id,
        type: 'post',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function (data) {
            if (data == true) {
                $('.bookmark').removeAttr('onclick').attr('onclick', 'unBookmarkAnswer('+answer_id+')').html('archived')
                $('.archive-'+answer_id).removeAttr('onclick').attr('onclick', 'unBookmarkAnswer('+answer_id+')').html('archived')
            }
        },
        error: function () {
            //notify('An error occured');
        }
    })
}

function unBookmarkAnswer(answer_id) {
    $.ajax({
        url: '/answers/un_bookmark_answer/?answer=' + answer_id,
        type: 'post',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function (data) {
            if (data == true){
                $('.bookmark').removeAttr('onclick').attr('onclick', 'bookmarkAnswer('+answer_id+')').html('archive');
                $('.archive-'+answer_id).removeAttr('onclick').attr('onclick', 'bookmarkAnswer('+answer_id+')').html('archive')
            }

        },
        error: function () {
            //notify('An error occured');
        }
    })
}


function follow(follows){
    $.ajax({
        url: '/follow/?follows='+follows,
        type: 'POST',
        data: {'user': user, 'follows':follows, 'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            if(data == true){
                $('.follow').html('- unfollow').attr('onclick', 'unfollow('+follows+')');
                $('.related-user-'+follows).hide();
            }
        },
        error: function(){
            //notify('An error occurred');
        }
    })
}

function unfollow(follows){
    $.ajax({
        url: '/unfollow/?follows='+follows,
        type: 'POST',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            if(data == true){
                $('.follow').html(' + follow').attr('onclick', 'follow('+follows+')');
            }
        },
        error: function(){
            //notify('An error occurred');
        }
    })
}

//Questions page

function loadQuestionAnswers() {
    $.ajax({
        url: '/questions/' + question_id + '/answers/',
        success: function (data) {
            console.log(data);
            if (data.length > 0) $('.no-of-answers').html(data.length + ' Answers');
            $.each(data, function (key, value) {
                $('.answers').append(QuestionAnswer(value))
            });
            $('img').addClass('img-responsive').css('position', 'relative').css('overflow', 'hidden').css('max-width', '100%').css('margin-left', '0px');
            $('.answer-content > ol').css('margin-left', '16px');
            $('.answer_content > ul').css('margin-left', '16px');
        },
        error: function () {
            console.log('Error Fetching answers')
        }
    })
}

$('.tile').mouseenter(function () {
    $(this).css('margin-left', '2px').css('margin-top', '2px');
})

$('.tile').mouseleave(function () {
    $(this).css('margin-left', '0px').css('margin-top', '0px');
})

function is_user_logged_in(){
    if(is_loggedin.includes('False'))return false;
    else return true;
}

function answer_question() {
    $('#answerModal').modal();
    $('.trumbowyg-editor').focus();
}

function delete_answer(answer_id) {
    $.ajax({
        url: '/answers/delete/?answer=' + answer_id,
        type: 'post',
        data: {'csrfmiddlewaretoken': '{{ csrf_token }}'},
        success: function (data) {
            if (data == true) window.location.reload(true);
        },
        error: function () {
            alert('Answer couldnt be deleted')
        }
    })
}


function QuestionAnswer(value) {
    return "<div class='card answer-box answer-"+value.id+"' style='width: 100%; padding: 15px; background-color: white;'> \
                 <div class='row'>\
                    <div class='col-lg-1'>\
                        <img src='"+value.writer.display_picture+"' alt='onsd' style='float: left' class='commenter-dp'>\
                    </div>\
                    <div class='col-lg-11' style='line-height: 25px;'>\
                    <a href='/profile/"+value.writer.user.username+"'>\
                        <span class='commenter-name'>" + value.writer.user.first_name + " " + value.writer.user.last_name + ", </span></a> <span class='bio'>" + getBio(value.writer) + "</span>\
                        <span class='pull-right badge'>" + value.writer.profile_no_of_views + "</span><br>\
                        <span class='bio'>" + convertdatetoword(value.date_written) + ", " + value.time_written + "<span><br>\
                        <span class='total-user-views glyphicon glyphicon-eye-open'> " + value.no_of_views + "</span> views\
                        <br/>\
                    </div>\
                </div>\
                <br>\
                <div class='answer-content'>\
                " + value.body + "\
                </div>\
                <br>\
                <p>\
                    " + question_check_logged_perm(value) + "\
                </p>\
            </div>";
}

function agree_with_this_answer(uv) {
    if (uv != 0) return uv + " people agree with this answer"
    else return ""
}


function question_check_logged_perm(value) {
    if (is_user_logged_in() && user==value.writer.user.username) {
        return "<span class='fa fa-chevron-up'></span>  " + value.no_of_upvotes + "<span style='margin-right: 10px;'></span>\
                            <span class='fa fa-chevron-down'></span>  " + value.no_of_downvotes + "<span style='margin-right: 10px;'></span>\
                            <a class='comment-link' onclick='openAnswerCommentBox("+value.id+")'><span class='fa fa-comments-o'></span> comment</a>\
                            <span class='btn-group' style='float: right; margin-right: 20px;'>\
                            <a href='/answers/edit/?answer=" + value.id + "'><button class='btn btn-primary btn-xs'><span class='fa fa-edit'></span> Edit</button></a>\
                            <a onclick='delete_answer(" + value.id + ")'><button class='btn btn- btn-xs'><span class='fa fa-trash'></span> Delete</button></a><br>\
                            </span>\
                            " + agree_with_this_answer(value.no_of_upvotes) + " &bullet; <a class='comment-link' onclick='showComments("+value.id+")'><small>"+value.no_of_comments+" comments </small></a>"
    }
    else if(is_user_logged_in() && user!=value.writer.user.username){
        return "" + check_if_answer_already_upvoted(value)+ "\
                            " + check_if_answer_already_downvoted(value) + "&bullet;\
                            <a class='comment-link' onclick='openAnswerCommentBox("+value.id+")'><span class='fa fa-comments-o'></span> comment</a> &bullet;\
                            <a class='comment-link'><span class='fa fa-legal'></span> report</a>\
                            " + check_if_bookmarked(value) + " &bullet; <a class='comment-link' onclick='showComments("+value.id+")'><small>"+value.no_of_comments+" comments </small></a>"
    }
    else if(!is_user_logged_in()){
        return "<span class='fa fa-chevron-up'></span>  " + value.no_of_upvotes + "<span style='margin-right: 10px;'></span>\
                            <span class='fa fa-chevron-down'></span>  " + value.no_of_downvotes + "<span style='margin-right: 10px;'></span>"
    }
}
;

function getBio(value) {
    if (value.bio != null) return value.bio
    else return ''
}


function openAnswerCommentBox(answer_id){
    $('.comment-div-'+answer_id).hide();

    $('.answer-'+answer_id).append("<br><div class='comment-div-"+answer_id+"'>\
        <label for='comment'>Your Comment:</label><a onclick='close_comment_box("+answer_id+")' class='comment-box-close-btn'>[X]</a>\
        <textarea name='comment' id='answer-comment-"+answer_id+"' cols='30' rows='4' class='form-control answer-comment comment-"+answer_id+"'></textarea>\
        <br>\
        <button class='btn btn-default' onclick='SubmitComment(1, "+answer_id+")'>Comment</button>\
    </div>");

    $('#answer-comment-'+answer_id).focus();
}

function openCommentCommentBox(comment_id){
    $('.reply-link-'+comment_id).hide();

    $('.comment-'+comment_id).append("<br><div class='comment-div-"+comment_id+"'>\
        <label for='comment'>Your Comment:</label><a onclick='close_comment_box("+comment_id+")' class='comment-box-close-btn'>[X]</a>\
        <textarea name='comment' id='comment-comment-"+comment_id+"' cols='30' rows='4' class='form-control comment-comment comment-"+comment_id+"'></textarea>\
        <br>\
        <button class='btn btn-default' onclick='SubmitComment(2, "+comment_id+")'>Comment</button>\
    </div>");

    $('#comment-comment-'+comment_id).focus();
}


function close_comment_box(parent_id){
    $('.comment-div-'+parent_id).hide();
    $('.reply-link-'+parent_id).show();
}

function SubmitComment(commentType, parent_id){
    var answer_comment_content = $('#answer-comment-'+parent_id).val();
    switch(commentType){
        case 1:
            $.ajax({
                url: '/comments/post/',
                method: 'POST',
                data: {'csrfmiddlewaretoken': csrftoken, 'comment_content': answer_comment_content, 'parent_id': parent_id,
                    'parent_type': 1},
                success: function(data){
                    window.location.reload(true);
                    alert('success posting comment');
                },
                error:function(data){
                    alert('An error occured');
                }

            });
            break;
        case 2:
            var comment_comment_content = $('#comment-comment-'+parent_id).val();
            $.ajax({
                url: '/comments/post/',
                method: 'POST',
                data: {'csrfmiddlewaretoken': csrftoken, 'comment_content': comment_comment_content, 'parent_id': parent_id,
                    'parent_type': 2},
                success: function(data){
                    window.location.reload(true);
                    alert('success posting comment');
                },
                error:function(data){
                    alert('An error occured');
                }
            })
    }
}


function showComments(answer_id){
    $('#commentsModal').modal();
    loadComments(answer_id);

}

function loadComments(answer_id){
    $.ajax({
        url: '/comments/?answer='+answer_id,
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            console.log(data)
            if(data.results.length == 0){
                $('.comment-modal-body').html('<h4>No Comment Under This Answer This Yet!!</h4>');
                $('.answer-comments').html('<h4>No Comment Under This Answer This Yet!!</h4>');
            }
            else{
                $('.comment-modal-body').html('');

                $('.comment-modal-header').html("<blockquote class='custom-bq'>\
                        <span class='comment-writer'><a href='#'>"+data.results[0].parent_answer.writer.user.first_name+" " +data.results[0].parent_answer.writer.user.last_name+"</a>, "+data.results[0].parent_answer.writer.bio+"</span>\
                        <div class='quoted-answer small'>"+get_exerpt_without_image(data.results[0].parent_answer.body)+"</div>\
                    </blockquote>");

                $.each(data.results, function(key, value){
                    $('.comment-modal-body').append("<blockquote class='custom-bq comment-"+value.id+"'>\
                        <span class='comment-writer'><a href='#'>"+value.writer.user.first_name+" "+value.writer.user.last_name+"</a>, "+value.writer.bio+"</span>\
                        <div class='quoted-answer small'>"+value.body+"</div>\
                        "+if_replies_dom(value)+"\
                    </blockquote>")

                    $('.answer-comments').append("<blockquote class='custom-bq comment-"+value.id+"'>\
                        <span class='comment-writer'><a href='#'>"+value.writer.user.first_name+" "+value.writer.user.last_name+"</a>, "+value.writer.bio+"</span>\
                        <div class='quoted-answer small'>"+value.body+"</div>\
                        "+if_replies_dom(value)+"\
                    </blockquote>")
                });
            }
        },
        error: function(data){
            alert('error')
        }
    })
}

function if_replies_dom(value){
    var lr = "<a onclick='openCommentCommentBox("+value.id+")' class='comment-link reply-link-"+value.id+"'>reply </a>";

    if(value.replies_count != 0){
        lr += "&bullet; <a class='load-rep-"+value.id+" comment-link' onclick='loadReplies("+value.id+", \""+value.replies+"\")'>load replies</a>";
    }
    return lr;
}

function loadReplies(parent_id, replies_url){
    $.ajax({
        url: replies_url,
        data: {'csrfmiddlewaretoken':csrftoken},
        success: function(data){
            if(data.length != 0){
                $.each(data, function(key, value){
                    $('.comment-'+parent_id).append("<blockquote class='custom-bq comment-"+value.id+"'>\
                        <span class='comment-writer'><a href='#'>"+value.writer.user.first_name+" "+value.writer.user.last_name+"</a>, "+value.writer.bio+"</span>\
                        <div class='quoted-answer small'>"+value.body+"</div>\
                    <p>"+if_replies_dom(value)+"</p>\
                    </blockquote>")
                });
                $('.load-rep-'+parent_id).hide();
            }
            else{
                $('.comment-'+parent_id).append("No replies to this comment");
                $('.load-rep-'+parent_id).hide()
            }
        },
        error: function(data){

        }
    })
}

//end questions page



//Profile Following tab
//var load_more = "<a href='#' onclick='load_more()' class='btn-load'><span class='fa fa-refresh'></span> Load More</a>";
var original_getfollowings_url = '/profile/'+req_user+'/followings';
var nextUrl = '/profile/'+req_user+'/followings';

function follow_item_dom(data){
    if(data.is_following.username != user){
        return "<div class='list-group-item'>\
                    <h4><a href='/profile/"+data.is_following.user.username+"'>"+data.is_following.user.first_name+" "+data.is_following.user.last_name+"</a></h4>\
                    "+follow_unfollow_button(check_if_following(data.is_following.user.id), data.is_following.user)+"\
                </div>"
    }
    else if(user=='AnonymousUser'){
        return "<div class='list-group-item'>\
                    <h4><a href='/profile/"+data.is_following.user.username+"'>"+data.is_following.user.first_name+" "+data.is_following.user.last_name+"</a></h4>\
                </div>"
    }
    else{
        return "<div class='list-group-item'>\
                    <h4><a href='/profile/"+data.is_following.user.username+"'>"+data.is_following.user.first_name+" "+data.is_following.user.last_name+"</a></h4>\
                </div>"
    }
}

function load_following(user){
    $('.loading-1').show();
    $.ajax({
        url: nextUrl,
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            if(!data.results) $('.following-window').append('<h3>No Following</h3>');
            else{
                $.each(data.results, function(key, value){
                    $('.following-window').append(follow_item_dom(value))
                });
            }
            if(data.next!=null){
                $('.btn-load').show();
                nextUrl = data.next;
                $('.loading-1').hide();
            }
            else{
                $('.loading-1').hide();
                $('.load-btn').hide();
            }

        },
        error: function (data) {
            console.log(data)
        }
    })
}

function check_if_following(follows){
    var is_following = false;
    $.ajax({
        url: '/is_following/?is_following='+follows,
        type: 'post',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function (data) {
            is_following = data;
        },
        error: function (data) {
            console.log(data)
        },
        async: false
    });

    return is_following;
}

function follow_unfollow_button(is_following_bool, follows){
    if(is_user_logged_in() && !is_following_bool) return "<a onclick='follow_item("+follows.id+")' class='btn btn-default follow-item-"+follows.id+"'> + follow </a>"
    else if(is_user_logged_in() && is_following_bool) return "<a onclick='unfollow_item("+follows.id+")' class='btn btn-default follow-item-"+follows.id+"'> - unfollow </a>"
    else return ""
}

function follow_item(follows){
    $.ajax({
        url: '/follow/?follows='+follows,
        type: 'POST',

        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            if(data == true){
                $('.follow-item-'+follows).html('- unfollow').attr('onclick', 'unfollow_item('+follows+')');
            }
        },
        error: function(){
            //notify('An error occurred');
        }
    })
}

function unfollow_item(follows){
    $.ajax({
        url: '/unfollow/?follows='+follows,
        type: 'POST',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            if(data == true){
                $('.follow-item-'+follows).html(' + follow').attr('onclick', 'follow_item('+follows+')');
                //notify("Unfollowed");
            }
        },
        error: function(){
            //notify('An error occurred');
        }
    })
}

function load_more(val){
    if(val==1)load_following(user);
    if(val==2)load_followers(user);
    if(val==3)load_questions(user);
    if(val==4)loadAnswers();
    if(val==5)loadTopicAnswers();
    if(val==6)loadExploreTopics();
    if(val==7)loadExplorePeople();
    if(val==8)loadExploreQuestions();
    if(val==9)loadTrending();
}

//Profile FOllowing tab

//Peofile FOllowers Tab
var original_getfollowers_url = '/profile/'+req_user+'/followers';
var nextPage = '/profile/'+req_user+'/followers';

function load_followers(user){
    $('.loading-1').show();
    $.ajax({
        url: nextPage,
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            if(!data.results) $('.follower-window').append('<h3>No Follower</h3>')
            else{
                $.each(data.results, function(key, value){
                    $('.follower-window').append(follower_item_dom(value))
                });
            }
            if(data.next!=null){
                nextPage = data.next;
                $('.loading-1').hide();
                $('.btn-load').show();
            }
            else{
                $('.loading-1').hide();
                $('.btn-load').hide();
            }

        },
        error: function (data) {
            console.log(data)
        }
    })
}

function follower_item_dom(data){
    if(data.user.username != user){
        return "<div class='list-group-item'>\
                    <h4><a href='/profile/"+data.user.user.username+"'>"+data.user.user.first_name+" "+data.user.user.last_name+"</a></h4>\
                    "+follow_unfollow_button(check_if_following(data.user.user.id), data.user.user)+"\
                </div>"
    }
    else if(user=='AnonymousUser'){
        return "<div class='list-group-item'>\
                    <h4><a href='/profile/"+data.user.user.username+"'>"+data.user.user.first_name+" "+data.user.user.last_name+"</a></h4>\
                </div>"
    }
    else{
        return "<div class='list-group-item'>\
                    <h4><a href='/profile/"+data.user.user.username+"'>"+data.user.user.first_name+" "+data.user.user.last_name+"</a></h4>\
                </div>"
    }
}


//Profile Questions Tab
var original_getquestions_url = '/questions/'+req_user+'/questions';
var nextQuestionPage = '/questions/'+req_user+'/questions';

function load_questions(user){
    $('.loading-1').show();
    $.ajax({
        url: nextQuestionPage,
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            if(!data.results) $('.questions-window').append('<h3>No Question</h3>')
            else{
                $.each(data.results, function(key, value){
                    $('.questions-window').append(question_item_dom(value))
                });
            }
            if(data.next!=null){
                nextQuestionPage = data.next;
                $('.loading-1').hide();
                $('.btn-load').show();
            }
            else{
                $('.loading-1').hide();
                $('.btn-load').hide();
            }

        },
        error: function (data) {
            console.log(data)
        }
    })
}

function question_item_dom(data){
    return "<div class='list-group-item'>\
                    <p>"+data.date_asked+"</p>\
                    <h3><a href='/questions/"+data.slug+"'>"+data.title+"</a></h3>\
                    <hr/>\
                </div>"
}


function loadTopicsThatUserFollows(){
    $.ajax({
        url: '/profile/topics_followed/?req_user='+req_user+'&user='+user,
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            if(!data) $('.topic-explore-list').append('<h3>No Topic Followed</h3>')
            else{
                $.each(data, function(key, value){
                    $('.topic-explore-list').append(explore_topic_dom(value));
                    if(user==req_user) $('.t-'+value.id).hide();
                });
            }
        },
        error: function (data) {
            console.log(data)
        }
    })
}


/////////////////////////END OF SCRIPT FOR PROFILE ///////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
////////TOPIC/////////////////////////////////////////////////////////////////////////////

function follow_topic(topic_id){
    $.ajax({
        url: '/topics/follow/?topic='+topic_id,
        method: 'post',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            if(data==true){
                $('.topic-follow-'+topic_id).attr('onclick', 'unfollow_topic('+topic_id+')').html('- unfollow');
                $('.t-'+topic_id).attr('onclick', 'unfollow_topic('+topic_id+')').html('- unfollow');
            }
            else{
                //do nothing
                alert(data)
            }
        },
        error: function(data){

        }
    })
}

function unfollow_topic(topic_id){
    $.ajax({
        url: '/topics/unfollow/?topic='+topic_id,
        method: 'post',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            if(data==true){
                $('.topic-follow-'+topic_id).attr('onclick', 'follow_topic('+topic_id+')').html('+ follow');
                $('.t-'+topic_id).attr('onclick', 'follow_topic('+topic_id+')').html('+ follow');
            }
            else{
                alert(data)
            }
        },
        error: function(data){
            alert(data)
        }
    })
}

function check_if_following_topic(topic_id){
    var b = false;
    $.ajax({
        url: '/topics/iffollow/?topic='+topic_id,
        method: 'post',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            b = data;
        },
        error: function(data){
            //alert(data);
        },
        async: false
    })
}

function loadTopicAnswers() {
    $.ajax({
        url: topic_load_url,
        dataType: 'json',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function (data) {
            if (!data.results) $('.post').append('<h3>No Answers written yet</h3>');
            else {
                $.each(data.results, function (key, value) {
                    $('.post').append(answer(value));
                    $('img').addClass('img-responsive');
                });
            }
            if (data.next != null) {
                $('.btn-load').show();
                topic_load_url = data.next;
                $('.loading-1').hide();
            }
            else {
                $('.loading-1').hide();
                $('.load-btn').hide();
            }

        },
        error: function () {
            console.log('Failed')
        }
    });
}

function loadRelatedTopics(){
    $.ajax({
        url: '/topics/related',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function (data) {
            $.each(data, function(key, value){
                if(value != undefined){
                    $('.other-topics').append(related_topic_dom(value));
                }
            });
            $('.loading-1').hide();
        },
        error: function(data){
            //alert(data);
        }
    })
}

function related_topic_dom(data){
    return "<li class='other-item'>\
                <img src='"+data.image_name+"' alt='"+data.title+"' class='related-topic-thumbnail'>\
                <span class='related-topic-right'>\
                    <a href='/topics/"+data.slug+"'>"+data.title+"</a>\
                    <a class='other-topic-follow-btn badge badge-follow-btn t-"+data.id+"' onclick='follow_topic("+data.id+")'>+ follow</a>\
                </span>\
                <hr class='other-topic-divisor'>\
            </li>";
}

function loadUsersWithCommonInterest(){
    $.ajax({
        url: related_users_load_url,
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function (data) {
            if(data){
                $.each(data, function(key, value){
                    $('.common-user-group').append(related_user_dom(value));
                });
                $('.loading-1-users').hide();
            }
            else{
                $('.common-user-group').append('<h6>No User currently following this topic that you are not following</h6>');
                $('.loading-1-users').hide();
            }
        },
        error: function(data){
            //alert(data);
        }
    })
}

function related_user_dom(user){
    return "<li class='list-group-item related-user-"+user.user.id+"'>\
        <img class='related-user-thumbnail' src='"+user.display_picture+"' alt='"+user.user.first_name+"'>\
        <a class='badge badge-follow-btn' onclick='follow("+user.user.id+")'>Follow</a>\
        <h5 class='list-group-item-heading'><a href='/profile/"+user.user.username+"'>"+user.user.first_name+" "+user.user.last_name+"</a></h5>\
        <p class='list-group-item-text'>"+user.bio+"</p>\
    </li>"
}


//EXPLORE
//////
//IN TOPIC/EXPLORE.HTML
/////


function loadExploreTopics(){
    $.ajax({
        url: next_explore_topic_url,
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            if(data.results){
                $.each(data.results, function (key, value) {
                    $('.topic-explore-list').append(explore_topic_dom(value))
                });
                next_explore_topic_url = data.next;
            }
            else{
                $('.topic-explore-list').append('<h3>Heyo, No new topic for you at the moment <br></h3>')
            }


            if(data.next!=null){
                $('.loading-1').hide();
                $('.btn-load').removeAttr('display').show();
            }
            else{
                $('.loading-1').hide();
                $('.btn-load').hide();
            }
        },
        error: function(data){
            console.log(data);
            $('.loading-1').hide();
            $('.btn-load').hide();
        }
    })
}

function explore_topic_dom(topic){
    return "<li class='list-group-item'>\
        <img class='related-user-thumbnail' src='"+topic.image_name+"' alt='"+topic.title+"'>\
        <a class='badge badge-follow-btn t-"+topic.id+"' onclick='follow_topic("+topic.id+")' target='_blank'>follow</a>\
        <h5 class='list-group-item-heading'><a href='/topics/"+topic.slug+"'>"+topic.title+"</a></h5>\
        <p class='list-group-item-text'>"+topic.desc+"</p>\
    </li>"
}

function loadExplorePeople(){
    $.ajax({
        url: next_explore_people_url,
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            if(data.results){
                $.each(data.results, function (key, value) {
                    $('.people-explore-list').append(explore_people_dom(value))
                });
                next_explore_people_url = data.next;
            }
            else{
                $('.people-explore-list').append('<h3>Heyo, No new user for you at the moment <br></h3>')
            }


            if(data.next!=null){
                $('.loading-1').hide();
                $('.btn-load').removeAttr('display').show();;
            }
            else{
                $('.loading-1').hide();
                $('.btn-load').hide();
            }
        },
        error: function(data){
            console.log(data);
            $('.loading-1').hide();
            $('.btn-load').hide();
        }
    })
}

function explore_people_dom(user){
    return "<li class='list-group-item related-user-"+user.user.id+"'>\
        <img class='related-user-thumbnail' src='"+user.display_picture+"' alt='"+user.user.first_name+"'>\
        <a class='badge badge-follow-btn' onclick='follow("+user.user.id+")' target='_blank'>+ follow</a>\
        <h5 class='list-group-item-heading'><a href='/profile/"+user.user.username+"'>"+user.user.first_name+" "+user.user.last_name+"</a></h5>\
      <p class='list-group-item-text'>"+user.bio+"</p>\
    </li>"
}



//Question explore
function loadExploreQuestions(){
    $.ajax({
        url: next_explore_questions_url,
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            console.log(data)
            if(data.results){
                $.each(data.results, function (key, value) {
                    $('.question-explore-list').append(explore_questions_dom(value))
                });
                next_explore_questions_url = data.next;
            }
            else{
                $('.question-explore-list').append('<h3>Heyo, No recent questions <br></h3>')
            }


            if(data.next!=null){
                $('.loading-1').hide();
                $('.btn-load').removeAttr('display').show();
            }
            else{
                $('.loading-1').hide();
                $('.btn-load').hide();
            }
        },
        error: function(data){
            console.log(data);
            $('.question-explore-list').append('<h3>Heyo, Please Register or Login<br></h3>')
            $('.loading-1').hide();
            $('.btn-load').hide();
        }
    })
}

function explore_questions_dom(question){
    return "<li class='list-group-item'>\
        <a class='badge badge-follow-btn' target='_blank' href='/questions/"+question.slug+"/answerit' _blank><span class='fa fa-pencil'> answer</span></a>\
        <h5 class='list-group-item-heading'><a href='/questions/"+question.slug+"'>"+question.title+"</a></h5>\
        <p class='list-group-item-text small'>"+get_exerpt_without_image(question.question_details)+"</p>\
        <hr style='margin-bottom: 3px;'>\
        <small>"+question.no_of_answers+" answers &middot; "+question_follow_btn_dom(question.id)+" "+people_following_question(question.no_following_quest)+"</small>  \
    </li>"
}

function people_following_question(no_of_followers){
    if(no_of_followers == 0){
        return ""
    }
    else if(no_of_followers == 1){
        return "&middot; 1 person following this question"
    }
    else{
        return "&middot; "+no_of_followers+" people are following this question";
    }
}


function question_follow_btn_dom(question){
    if (is_following_question(question)) return "<a class='question-follow question-follow-"+question+"' onclick='unfollow_question("+question+")'>-unfollow</a>"
    else return "<a class='question-follow question-follow-"+question+"' onclick='follow_question("+question+")'>+follow</a>"
}

function is_following_question(question){
    var bool_ = false;
    $.ajax({
        url: '/questions/is_following/?question='+question,
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function (data) {
            console.log(data)
            bool_ = data
        },
        error: function(data) {
            bool_ = data
        },
        async:false
    });
    return bool_;
}

function follow_question(question){
    $.ajax({
        url: '/questions/follow/?question='+question+'',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function (data) {
            $('.question-follow-'+question).html('-unfollow').attr('onclick', 'unfollow_question('+question+')');
        },
        error: function(data) {
            console.log(data);
        }
    });
}

function unfollow_question(question){
    $.ajax({
        url: '/questions/unfollow/?question='+question+'',
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function (data) {
            $('.question-follow-'+question).html('+follow').attr('onclick', 'follow_question('+question+')');
        },
        error: function(data) {

        }
    });
}

function loadTrending(){
    $.ajax({
        url: next_trending_url,
        data: {'csrfmiddlewaretoken': csrftoken},
        success: function(data){
            console.log(data);
            if(data.results){
                $.each(data.results, function (key, value) {
                    $('.trending-list').append(trending_dom(value))
                });
                next_trending_url = data.next;
            }
            else{
                $('.trending-list').append('<h3>Heyo, No Posts Yet <br></h3>')
            }


            if(data.next!=null){
                $('.loading-1').hide();
                $('.btn-load').removeAttr('display').show();
            }
            else{
                $('.loading-1').hide();
                $('.btn-load').hide();
            }
        },
        error: function(data){
            console.log(data);
            $('.question-explore-list').append('<h3>Heyo, Please Register or Login<br></h3>')
            $('.loading-1').hide();
            $('.btn-load').hide();
        }
    })
}


function trending_dom(answer){
    return "<li class='list-group-item trending-answer-"+answer.id+"'>\
        <span class='small wrote-an-answer-to'>&middot; "+answer.writer.user.first_name+" wrote an answer to "+answer.question.title+"</span>\
        <h5><a href='/questions/'"+answer.question.slug+"' target='_blank'>"+answer.question.title+"</a></h5>\
        <img class='related-user-thumbnail' src='"+answer.writer.display_picture+"' alt='"+answer.writer.user.first_name+"'>\
        <a class='list-group-item-heading' target='_blank' href='/profile/"+answer.writer.user.username+"'>"+answer.writer.user.first_name+" "+answer.writer.user.last_name+",</a>\
        <span class='small'>"+answer.writer.bio+"</span>\
        <p class='small'>Answer written on "+convertdatetoword(answer.date_written)+", "+answer.time_written+"</p>\
        <p class='list-group-item-text trending-answer-text'>"+get_exerpt_without_image(answer.body)+"" +
        "<br/><a href='/answers/"+answer.id+"' target='_blank'>..read more</a></p>\
      <p>"+check_logged_perm(answer)+"</p>\
    </li>"
}