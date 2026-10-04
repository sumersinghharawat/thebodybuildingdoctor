<x-mail::message>
# Support update

Hi {{ $ticket->name }},

Our team replied to your technical support ticket **{{ $ticket->subject }}**.

**Reply**

{{ $reply->body }}

<x-mail::button :url="$supportUrl">
Submit another request
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
